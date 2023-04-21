import Logger from "bunyan";

import API from "./api";
import { KasumiConfig } from "./type";
import Message from "./message";
import WebSocket from "./websocket";
import WebHook from "./webhook";
import Plugin from "./plugin"
import WebSocketSource from "./websocket-botroot";
import { BaseReceiver, WebsocketReceiver } from "./websocket-kookts/event-receiver";
import { BaseClient } from "./websocket-kookts";
export { default as BaseMenu } from "./plugin/menu/baseMenu";
export { default as BaseCommand, CommandFunction } from "./plugin/menu/baseCommand";
export { default as BaseSession } from "./plugin/session";
export { default as Card } from './card';

export * from './message/type'


export default class Kasumi {
    API: API;
    message: Message;
    plugin: Plugin;
    websocket?: WebSocket | WebSocketSource | BaseReceiver
    webhook?: WebHook;
    logger: Logger;

    /**
     * Profile of the current bot
     */
    me: {
        userId: string,
        username: string,
        identifyNum: string,
        avatar: string
    } = {
            userId: '',
            username: '',
            identifyNum: '',
            avatar: ''
        }

    readonly TOKEN: string;
    readonly BUNYAN_LOG_LEVEL: Logger.LogLevel;
    readonly BUNYAN_ERROR_LEVEL: Logger.LogLevel;
    readonly DISABLE_SN_ORDER_CHECK: boolean;
    private readonly CONFIG: KasumiConfig;

    constructor(config: KasumiConfig) {
        switch (process.env.LOG_LEVEL?.toLowerCase()) {
            case 'verbose':
            case 'more':
            case 'trace':
                this.BUNYAN_LOG_LEVEL = Logger.TRACE;
                break;
            case 'debug':
                this.BUNYAN_LOG_LEVEL = Logger.DEBUG;
                break;
            case 'less':
            case 'warn':
                this.BUNYAN_LOG_LEVEL = Logger.WARN;
                break;
            default:
                this.BUNYAN_LOG_LEVEL = Logger.INFO;
        }
        switch (process.env.ERROR_LEVEL?.toLowerCase()) {
            case 'verbose':
            case 'more':
            case 'info':
                this.BUNYAN_ERROR_LEVEL = Logger.INFO;
                break;
            case 'less':
            case 'error':
                this.BUNYAN_ERROR_LEVEL = Logger.ERROR;
                break;
            default:
                this.BUNYAN_ERROR_LEVEL = Logger.WARN;
        }
        this.logger = this.getLogger();

        this.CONFIG = structuredClone(config);
        this.TOKEN = this.CONFIG.token;
        this.DISABLE_SN_ORDER_CHECK = this.CONFIG.disableSnOrderCheck || false;

        this.message = new Message(this);
        this.plugin = new Plugin(this);
        this.API = new API(this.TOKEN, this.getLogger('requestor'));

        this.message.on('allTextMessages', (event) => {
            this.plugin.messageProcessing(event.content, event);
        })
    }
    getLogger(...name: string[]) {
        return new Logger({
            name: `${['kasumi', ...name].join('.')}`,
            streams: [
                {
                    stream: process.stdout,
                    level: this.BUNYAN_LOG_LEVEL
                },
                {
                    stream: process.stderr,
                    level: this.BUNYAN_ERROR_LEVEL
                }
            ]
        });
    }
    async fetchMe() {
        const { err, data } = await this.API.user.me();
        if (err) {
            this.logger.error('Getting bot details failed, retrying in 30s');
            setTimeout(() => { this.connect() }, 30 * 1000);
            return;
        }
        let profile = data;
        this.me.userId = profile.id;
        this.me.username = profile.username;
        this.me.identifyNum = profile.identify_num;
        this.me.avatar = profile.avatar;
        this.logger.info(`Logged in as ${this.me.username}#${this.me.identifyNum} (${this.me.userId})`);
    }
    async connect() {
        await this.fetchMe();
        if (this.CONFIG.type == 'websocket') {
            const { err } = await this.API.user.offline();
            if (err) throw err;
            if (this.CONFIG.vendor == 'botroot') {
                this.websocket = new WebSocketSource(this, false);
                this.websocket.connect();
            } else if (this.CONFIG.vendor == 'kookts') {
                this.websocket = new WebsocketReceiver(new BaseClient(this));
                this.websocket.connect();
            }
            else this.websocket = new WebSocket(this);
        } else {
            this.webhook = new WebHook(this.CONFIG, this);
        }
    }
    // on = this.message.on;
    // emit = this.message.emit;
}