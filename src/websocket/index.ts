import ws from 'ws';
import Logger from 'bunyan';
import { WebSocket } from '../type'
import delay from 'delay';
import { TimeoutError } from '../error';
import Kasumi from '../';

export default class WS {
    public logger: Logger;
    private Socket?: ws;
    private client: Kasumi;
    private state: WebSocket.State;
    private sessionId: string = '';
    private sn: number = 0;
    private messageQueue: WebSocket.MessageQueue = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
    constructor(client: Kasumi) {
        this.client = client;
        this.logger = new Logger({
            name: 'kasumi.websocket',
            streams: [{
                stream: process.stdout,
                level: this.client.__bunyan_log_level
            }, {
                stream: process.stderr,
                level: this.client.__bunyan_error_level
            }]
        });
        this.state = WebSocket.State.Initialization;
        this.ensureWebSocketConnection();
    }
    private getTimeDifference(start: number, end: number = Date.now()) {
        return Math.abs(end - start);
    }
    private async getNextItemFromQueue<T extends WebSocket.SignalType>(type: T, timeout?: number, lastTimestamp: number = Date.now()): Promise<WebSocket.MessageTypes[T]> {
        while (!this.messageQueue[type].length) {
            let timeDifference = this.getTimeDifference(lastTimestamp);
            if (timeout && timeDifference > timeout) throw new TimeoutError(timeDifference);
            await delay(10);
        }
        let lastItem = this.messageQueue[type].pop();
        if (lastItem) return <WebSocket.MessageTypes[T]>lastItem;
        else return this.getNextItemFromQueue(type, timeout, lastTimestamp);
    }
    private async connectWebSocket(resume: boolean = false) {
        this.state = WebSocket.State.ConnectGateway;
        let gateway = (await this.client.rest.gateway.index()).url;
        if (resume && this.sessionId) this.Socket = new ws(`${gateway}?compress=0&resume=1&sessionId=${this.sessionId}&sn=${this.sn}`);
        else {
            this.sn = 0;
            this.messageQueue = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
            this.Socket = new ws(gateway + '?compress=0');
        }
        this.Socket.on('open', async () => {
            this.logger.debug('WebSocket connection established');
            this.state = WebSocket.State.Initialization;

            setInterval(async () => {
                this.Socket?.send(Buffer.from(JSON.stringify({
                    s: 2,
                    sn: this.sn
                })))
                await this.getNextItemFromQueue(WebSocket.SignalType.Pong, 6 * 1000);
            }, 30 * 1000)

            this.getNextItemFromQueue(WebSocket.SignalType.Hello, 6 * 1000).then(async (helloPackage) => {
                this.logger.debug('Recieved Hello');
                this.state = WebSocket.State.RecievingMessage;
                this.sessionId = helloPackage.d.session_id;
            }).catch((e) => {
                if (e instanceof TimeoutError) {
                    this.state = WebSocket.State.NeedsRestart;
                    return;
                } else throw e;
            });
        })
        this.Socket.on('message', async (buffer: Buffer) => {
            const data: WebSocket.Signals = JSON.parse(buffer.toString());
            this.logger.trace(data);
            switch (data.s) {
                case WebSocket.SignalType.Event: {
                    if (this.sn < data.sn)
                        this.sn = data.sn;
                    this.client.message.recievedMessage(data);
                    break;
                }
                case WebSocket.SignalType.Reconnect: {
                    this.state = WebSocket.State.NeedsRestart;
                    break;
                }
                case WebSocket.SignalType.ResumeACK: {
                    this.logger.info("Resumed WebSocket connection");
                    this.sessionId = data.d.session_id;
                    break;
                }
                default: {
                    this.messageQueue[data.s].push(<any>data)
                }
            }
        });
    }
    private async ensureWebSocketConnection() {
        this.connectWebSocket();
        setInterval(async () => {
            if (this.state == WebSocket.State.NeedsRestart) {
                this.logger.info('WebSocket needs to reconnect');
                this.Socket?.removeAllListeners();
                this.connectWebSocket(true);
            }
        }, 500)
    }
}