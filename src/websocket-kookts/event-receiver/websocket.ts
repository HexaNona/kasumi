import { Atom, addChangeHandler, deref, swap } from "@libre/atom";
import { RequestResponse } from "@ksm/type";
import WebSocket from "ws";
import { BaseClient } from "@ksm/websocket-kookts/base";
import { BaseReceiver } from "./base";
import {
    TimeoutKey,
    TTimeout,
    States,
    Actions,
    State,
    Action,
    Effect,
    Effects,
    KOpcode,
    KEventPacket,
    KPingPacket,
    KPacket,
    KHelloPacket,
} from "./types";
import { transform, inflate } from "./websocket.helper";
import { RawGatewayResponse } from "@ksm/api/gateway/type";

export class WebsocketReceiver extends BaseReceiver {
    type = "websocket-fsm";
    ws?: WebSocket;
    url?: string;
    sessionId?: string;

    private wsState: any;
    // private wsState: Atom<State>;

    timeouts = new Map<TimeoutKey, TTimeout>();

    eventListeners = new Map<string, (event: unknown) => void>();

    constructor(client: BaseClient) {
        super(client);
        this.wsState = Atom.of(
            States.INITIAL({
                compress: true,
                retryCount: 0,
                helloTimeoutMillis: 6000,
                heartbeatIntervalMillis: 30000,
                heartbeatTimeoutMillis: 6000,
            })
        );

        addChangeHandler(
            this.wsState,
            "wsStateHandler",
            ({ previous, current }) => {
                if ((previous as any).tag !== (current as any).tag) {
                    this.client.logger.debug(
                        `WebSocket state changed: ${(previous as any).tag} -> ${
                            (current as any).tag
                        }`
                    );
                }
            }
        );
    }

    async connect() {
        this.transition(Actions.PULL_GATEWAY());
    }

    currentState(): State {
        return deref(this.wsState);
    }

    private nukeTimeout(k: TimeoutKey) {
        const t = this.timeouts.get(k);
        if (t) clearTimeout(t);
    }

    private addEventListener(
        type: "open" | "close" | "error" | "message",
        handler: (event: unknown) => void
    ) {
        if (this.ws) {
            this.ws.addListener(type, handler);
            this.eventListeners.set(type, handler);
        }
    }

    private clearEventListeners() {
        this.eventListeners.forEach((h, k) => {
            this.ws?.removeListener(k, h);
        });
        this.eventListeners.clear();
    }

    private clearTimeouts() {
        this.timeouts.forEach((v, k) => this.nukeTimeout(k));
    }

    private transition(a: Action) {
        const [newState, effects] = transform(a, deref(this.wsState));
        swap(this.wsState, () => newState);
        effects.forEach(this.handleEffect.bind(this));
    }

    // here gives the way to handle effects (where happens when state changes)
    // basically **effect** means side effect which changes the attribute of this object itself
    private handleEffect(e: Effect) {
        const self = this;
        return Effects.match(e, {
            PULL_GATEWAY: ({ compress }) => {
                self.client.kasumi.API.gateway
                    .index(compress ? 1 : 0)
                    .then(
                        ({
                            err,
                            data,
                        }: RequestResponse<RawGatewayResponse>) => {
                            if (err) throw err;
                            self.url = data.url;
                            self.transition(Actions.CONNECT_GATEWAY());
                        }
                    )
                    .catch(() => {
                        this.client.logger.error("Getting gateway error");
                        self.transition(Actions.CLOSE());
                        self.transition(Actions.RECONNECT());
                    });
            },

            CONNECT_WS: (conn) => {
                if (self.ws) {
                    self.clearEventListeners();
                    self.clearTimeouts();
                    self.ws.close();
                }

                if (!self.url) {
                    self.transition(Actions.PULL_GATEWAY());
                    return;
                }

                const sessionIdPart = self.sessionId
                    ? `&resule=1&sessionId=${self.sessionId}&sn=${self.sn}`
                    : "";
                self.ws = new WebSocket(self.url + sessionIdPart);

                const onOpen = () => {
                    this.client.kasumi.emit("connect.websocket", {
                        type: "websocket",
                        vendor: "kookts",
                        sessionId: this.sessionId,
                        bot: structuredClone(this.client.kasumi.me),
                    });
                    return self.transition(Actions.OPEN());
                };
                self.addEventListener("open", onOpen);

                const onClose = () => {
                    self.transition(conn.onClose);
                    self.transition(Actions.RECONNECT());
                };
                self.addEventListener("close", onClose);

                const onMessage = (ev: unknown) => {
                    self.dataParse(ev, conn.compress)
                        .then((packet) => {
                            if (packet) {
                                switch (packet.s) {
                                    case KOpcode.HELLO:
                                        self.handleHelloPacket(packet);
                                        break;
                                    case KOpcode.EVENT:
                                        self.onEventArrive(
                                            packet as KEventPacket
                                        );
                                        break;
                                    case KOpcode.PING:
                                        this.client.logger.warn(
                                            "Receive Wrong Direction Packet!"
                                        );
                                        break;
                                    case KOpcode.PONG:
                                        self.transition(conn.onPongMessage);
                                        break;
                                    case KOpcode.RECONNECT:
                                        // TODO: General retry
                                        self.clearTimeouts();
                                        self.sn = 0;
                                        self.sessionId = undefined;
                                        self.buffer = [];
                                        this.client.logger.warn(
                                            "Receive Reconnect Packet : " +
                                                JSON.stringify(packet.d)
                                        );
                                        self.transition(Actions.CLOSE());
                                        self.transition(Actions.RECONNECT());
                                        break;
                                    case KOpcode.RESUME_ACK:
                                        break;
                                    default:
                                        this.client.logger.debug(packet);
                                        break;
                                }
                            }
                        })
                        .catch((err) => {
                            this.client.logger.error(
                                "Parsing message error: ",
                                err
                            );
                            self.transition(Actions.CLOSE());
                            self.transition(Actions.RECONNECT());
                        });
                };
                self.addEventListener("message", onMessage);
                //TODO: handle on error
            },

            SCHEDULE_TIMEOUT: (t) => {
                self.timeouts.set(
                    t.key,
                    setTimeout(
                        () => self.transition(t.onTimeout),
                        t.timeoutMillis
                    )
                );
            },

            SEND_PING: () => {
                if (self.ws) {
                    self.ws.send(
                        JSON.stringify({
                            s: KOpcode.PING,
                            sn: self.sn,
                        } as KPingPacket)
                    );
                }
            },

            CLEAR_TIMEOUT: (t) => self.nukeTimeout(t.key),

            TRIGGER_ACTION: (a) => self.transition(a.action),
        });
    }

    private async dataParse(
        data: unknown,
        compress: boolean
    ): Promise<KPacket | undefined> {
        if (!data) {
            return undefined;
        }
        if (compress && Buffer.isBuffer(data)) {
            return JSON.parse((await inflate(data)).toString()) as KPacket;
        } else {
            return JSON.parse((data as ArrayBufferLike).toString()) as KPacket;
        }
    }

    private handleHelloPacket(packet: KHelloPacket) {
        switch (packet.d.code) {
            case 0:
                if (this.sessionId != packet.d.session_id) {
                    this.buffer = [];
                    this.sn = 0;
                }
                this.sessionId = packet.d.session_id;
                this.transition(Actions.OPEN());
                break;
            case 40100:
            case 40101:
            case 40102:
            case 40103:
                this.transition(Actions.CLOSE());
                this.transition(Actions.RECONNECT());
                break;
            default:
                this.client.logger.warn(`Receive ${packet.d.code}, Ignored`);
                break;
        }
    }
}
