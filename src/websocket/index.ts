import ws from "ws";
import Logger from "bunyan";
import { WebSocket as WebSocketType } from "@ksm/type";
import delay from "delay";
import { TimeoutError } from "@ksm/error";
import Kasumi from "@ksm/client";

export default class WebSocket {
    public logger: Logger;
    private Socket?: ws;
    private client: Kasumi<any>;
    private state: WebSocketType.State;
    private sessionId: string = "";
    private sn: number = 0;
    private messageBuffer: WebSocketType.Signal.Event[] = [];
    private messageQueue: WebSocketType.MessageQueue = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
    };
    constructor(client: Kasumi<any>) {
        this.client = client;
        this.logger = this.client.getLogger("websocket", "hexona");
        this.state = WebSocketType.State.Initialization;
        this.ensureWebSocketTypeConnection();
    }
    private getTimeDifference(start: number, end: number = Date.now()) {
        return Math.abs(end - start);
    }
    private async getNextItemFromQueue<T extends WebSocketType.SignalType>(
        type: T,
        timeout?: number,
        lastTimestamp: number = Date.now()
    ): Promise<WebSocketType.MessageTypes[T]> {
        while (!this.messageQueue[type].length) {
            let timeDifference = this.getTimeDifference(lastTimestamp);
            if (timeout && timeDifference > timeout)
                throw new TimeoutError(timeDifference);
            await delay(10);
        }
        let lastItem = this.messageQueue[type].pop();
        if (lastItem) return <WebSocketType.MessageTypes[T]>lastItem;
        else return this.getNextItemFromQueue(type, timeout, lastTimestamp);
    }

    private __interval?: NodeJS.Timeout;

    private async connectWebSocket(resume: boolean = false) {
        this.state = WebSocketType.State.ConnectGateway;
        const { err, data } = await this.client.API.gateway.index();
        if (err) {
            this.logger.error("Getting gateway failed");
            this.logger.error(err);
            this.reconnectWebSocket();
            return;
        }
        let gateway = data.url;
        if (resume && this.sessionId)
            this.Socket = new ws(
                `${gateway}?compress=0&resume=1&sessionId=${this.sessionId}&sn=${this.sn}`
            );
        else {
            this.sn = 0;
            this.messageQueue = {
                0: [],
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
                6: [],
            };
            this.Socket = new ws(gateway + "?compress=0");
        }
        this.Socket.on("open", async () => {
            this.logger.debug("WebSocket connection established");
            this.state = WebSocketType.State.ConnectionOpen;

            this.__interval = setInterval(async () => {
                try {
                    this.Socket?.send(
                        Buffer.from(
                            JSON.stringify({
                                s: 2,
                                sn: this.sn,
                            })
                        )
                    );
                    await this.getNextItemFromQueue(
                        WebSocketType.SignalType.Pong,
                        6 * 1000
                    ).catch((e) => {
                        if (e instanceof TimeoutError) {
                            this.state = WebSocketType.State.NeedsRestart;
                            this.logger.warn("PING timed out, retrying");
                        } else throw e;
                    });
                } catch (e) {
                    this.logger.error(e);
                    this.reconnectWebSocket();
                }
            }, 30 * 1000);

            this.getNextItemFromQueue(WebSocketType.SignalType.Hello, 6 * 1000)
                .then(async (helloPackage) => {
                    if (helloPackage.d.code == 0) {
                        this.logger.debug("Recieved HELLO");
                        this.state = WebSocketType.State.RecievingMessage;
                        this.sessionId = helloPackage.d.session_id;
                        this.client.emit("connect.websocket", {
                            type: "websocket",
                            vendor: "hexona",
                            sessionId: this.sessionId,
                            bot: structuredClone(this.client.me),
                        });
                    } else {
                        this.logger.warn("HELLO not successful");
                        this.logger.warn(
                            `Recieving code ${helloPackage.d.code}`
                        );
                        this.state = WebSocketType.State.NeedsRestart;
                    }
                })
                .catch((e) => {
                    if (e instanceof TimeoutError) {
                        this.state = WebSocketType.State.NeedsRestart;
                        this.logger.warn(
                            `Cannot recieve HELLO package. ${e.message}, retrying`
                        );
                        return;
                    } else throw e;
                });
        });
        this.Socket.on("message", async (buffer: Buffer) => {
            const data: WebSocketType.Signals = JSON.parse(buffer.toString());
            // this.logger.trace(data);
            switch (data.s) {
                case WebSocketType.SignalType.Event: {
                    this.logger.trace(
                        `Recieved message "${data.d.content}" from ${data.d.author_id}, ID = ${data.d.msg_id}`,
                        {
                            cur_sn: this.sn,
                            msg_sn: data.sn,
                        }
                    );
                    if (this.client.DISABLE_SN_ORDER_CHECK) {
                        // Disable SN order check per config
                        this.sn = data.sn;
                        return this.client.message.recievedMessage(data);
                    }
                    this.messageBuffer.push(data);
                    this.messageBuffer.sort((a, b) => {
                        return a.sn - b.sn;
                    });
                    while (
                        this.messageBuffer[0] &&
                        this.messageBuffer[0].sn <= this.sn
                    )
                        this.messageBuffer.shift();
                    while (
                        this.messageBuffer[0] &&
                        this.sn + 1 == this.messageBuffer[0].sn
                    ) {
                        let buffer = this.messageBuffer.shift();
                        if (buffer) {
                            this.client.message.recievedMessage(buffer);
                            this.sn = buffer.sn;
                            if (this.sn >= 65535) this.sn = 0;
                        }
                        while (
                            this.messageBuffer[0] &&
                            this.messageBuffer[0].sn < this.sn
                        )
                            this.messageBuffer.shift();
                    }
                    this.logger.trace(
                        `${this.messageBuffer.length} more message(s) in buffer`
                    );
                    this.logger.trace(this.messageBuffer.map((v) => v.sn));
                    break;
                }
                case WebSocketType.SignalType.Reconnect: {
                    this.state = WebSocketType.State.NeedsRestart;
                    break;
                }
                case WebSocketType.SignalType.ResumeACK: {
                    this.logger.info("Resumed WebSocket connection");
                    this.sessionId = data.d.session_id;
                    break;
                }
                default: {
                    this.messageQueue[data.s].push(<any>data);
                }
            }
        });

        this.Socket.on("close", () => {
            this.reconnectWebSocket();
        });
        this.Socket.on("error", (e) => {
            this.logger.error(e);
            this.reconnectWebSocket();
        });
    }

    private reconnectWebSocket() {
        if (this.state == WebSocketType.State.Initialization) return;
        this.state = WebSocketType.State.Initialization;
        this.logger.info("Reconnectting WebSocket in 90s");
        if (this.Socket) {
            const socket = this.Socket;
            delete this.Socket;
            socket.close();
        }
        clearInterval(this.__interval);
        delete this.__interval;
        // this.connectWebSocket(true);
        setTimeout(() => {
            this.connectWebSocket(true);
        }, 90 * 1000);
    }
    private ensureWebSocketTypeConnection() {
        this.connectWebSocket();
        const interval = async () => {
            if (this.state == WebSocketType.State.NeedsRestart) {
                this.logger.info("WebSocket needs to reconnect");
                this.reconnectWebSocket();
            }
            setTimeout(() => {
                interval();
            }, 500);
        };
        interval();
    }
}
