import ws from 'ws';
import Logger from 'bunyan';
import { WebSocket as WebSocketType } from '../type'
import delay from 'delay';
import { TimeoutError } from '../error';
import Kasumi from '../';

export default class WebSocket {
    public logger: Logger;
    private Socket?: ws;
    private client: Kasumi;
    private state: WebSocketType.State;
    private sessionId: string = '';
    private sn: number = 0;
    private messageBuffer: WebSocketType.Signal.Event[] = [];
    private messageQueue: WebSocketType.MessageQueue = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
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
        this.state = WebSocketType.State.Initialization;
        this.ensureWebSocketTypeConnection();
    }
    private getTimeDifference(start: number, end: number = Date.now()) {
        return Math.abs(end - start);
    }
    private async getNextItemFromQueue<T extends WebSocketType.SignalType>(type: T, timeout?: number, lastTimestamp: number = Date.now()): Promise<WebSocketType.MessageTypes[T]> {
        while (!this.messageQueue[type].length) {
            let timeDifference = this.getTimeDifference(lastTimestamp);
            if (timeout && timeDifference > timeout) throw new TimeoutError(timeDifference);
            await delay(10);
        }
        let lastItem = this.messageQueue[type].pop();
        if (lastItem) return <WebSocketType.MessageTypes[T]>lastItem;
        else return this.getNextItemFromQueue(type, timeout, lastTimestamp);
    }

    private __interval?: NodeJS.Timer;

    private async connectWebSocketType(resume: boolean = false) {
        this.state = WebSocketType.State.ConnectGateway;
        let gateway = (await this.client.API.gateway.index()).url;
        if (resume && this.sessionId) this.Socket = new ws(`${gateway}?compress=0&resume=1&sessionId=${this.sessionId}&sn=${this.sn}`);
        else {
            this.sn = 0;
            this.messageQueue = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
            this.Socket = new ws(gateway + '?compress=0');
        }
        this.Socket.on('open', async () => {
            this.logger.debug('WebSocketType connection established');
            this.state = WebSocketType.State.Initialization;

            this.__interval = setInterval(async () => {
                this.Socket?.send(Buffer.from(JSON.stringify({
                    s: 2,
                    sn: this.sn
                })))
                await this.getNextItemFromQueue(WebSocketType.SignalType.Pong, 6 * 1000).catch((e) => {
                    if (e instanceof TimeoutError) {
                        this.state = WebSocketType.State.NeedsRestart;
                        this.logger.warn("PING timed out, retrying");
                    } else throw e;
                });
            }, 30 * 1000);

            this.getNextItemFromQueue(WebSocketType.SignalType.Hello, 6 * 1000).then(async (helloPackage) => {
                this.logger.debug('Recieved HELLO');
                this.state = WebSocketType.State.RecievingMessage;
                this.sessionId = helloPackage.d.session_id;
            }).catch((e) => {
                if (e instanceof TimeoutError) {
                    this.state = WebSocketType.State.NeedsRestart;
                    this.logger.warn("Cannot recieve HELLO package, retrying");
                    return;
                } else throw e;
            });
        })
        this.Socket.on('message', async (buffer: Buffer) => {
            const data: WebSocketType.Signals = JSON.parse(buffer.toString());
            this.logger.trace(data);
            switch (data.s) {
                case WebSocketType.SignalType.Event: {
                    this.messageBuffer.push(data);
                    this.messageBuffer.sort((a, b) => { return a.sn - b.sn });
                    while (this.messageBuffer[0] && this.sn + 1 == this.messageBuffer[0].sn) {
                        let buffer = this.messageBuffer.pop();
                        if (buffer) {
                            this.client.message.recievedMessage(buffer);
                            this.sn = buffer.sn;
                            if (this.sn >= 65536) this.sn = 0;
                        }
                    }
                    break;
                }
                case WebSocketType.SignalType.Reconnect: {
                    this.state = WebSocketType.State.NeedsRestart;
                    break;
                }
                case WebSocketType.SignalType.ResumeACK: {
                    this.logger.info("Resumed WebSocketType connection");
                    this.sessionId = data.d.session_id;
                    break;
                }
                default: {
                    this.messageQueue[data.s].push(<any>data)
                }
            }
        });
    }
    private async ensureWebSocketTypeConnection() {
        this.connectWebSocketType();
        setInterval(async () => {
            if (this.state == WebSocketType.State.NeedsRestart) {
                this.logger.info('WebSocketType needs to reconnect');
                this.Socket?.removeAllListeners();
                clearInterval(this.__interval);
                this.Socket = undefined;
                this.__interval = undefined;
                this.connectWebSocketType(true);
            }
        }, 500)
    }
}