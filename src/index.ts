import Logger from "bunyan";

import API from "./api";
import { KasumiConfig } from "./type";
import Message from "./message";
import WebSocket from "./websocket";
import WebHook from "./webhook";
import Plugin from "./plugin"
import WebSocketSource from "./webhook-botroot";
export { default as BaseMenu } from "./plugin/menu/baseMenu";
export { default as BaseCommand, CommandFunction } from "./plugin/menu/baseCommand";
export { default as BaseSession } from "./plugin/session";
export { default as Card } from './card';

import { retry } from "./util";

export * from './message/type'


export default class Kasumi {
    API: API;
    message: Message;
    plugin: Plugin;
    websocket?: WebSocket;
    websocketBotRoot?: WebSocketSource;
    webhook?: WebHook;
    logger: Logger;

    /**
     * Profile of the current bot
     */
    userId!: string;
    username!: string;
    identifyNum!: string;

    __token: string;
    __bunyan_log_level: Logger.LogLevel;
    __bunyan_error_level: Logger.LogLevel;
    private __config: KasumiConfig;
    constructor(config: KasumiConfig) {
        switch (process.env.LOG_LEVEL?.toLowerCase()) {
            case 'verbose':
            case 'more':
            case 'trace':
                this.__bunyan_log_level = Logger.TRACE;
                break;
            case 'debug':
                this.__bunyan_log_level = Logger.DEBUG;
                break;
            case 'less':
            case 'warn':
                this.__bunyan_log_level = Logger.WARN;
                break;
            default:
                this.__bunyan_log_level = Logger.INFO;
        }
        switch (process.env.ERROR_LEVEL?.toLowerCase()) {
            case 'verbose':
            case 'more':
            case 'info':
                this.__bunyan_error_level = Logger.INFO;
                break;
            case 'less':
            case 'error':
                this.__bunyan_error_level = Logger.ERROR;
                break;
            default:
                this.__bunyan_error_level = Logger.WARN;
        }
        this.logger = this.getLogger();

        this.__config = config;
        this.__token = this.__config.token;

        this.message = new Message(this);
        this.plugin = new Plugin(this);
        this.API = new API(this.__token, this.getLogger('requestor'));

        this.message.on('allTextMessages', (event) => {
            this.plugin.messageProcessing(event.content, event);
        })
    }
    getLogger(...name: string[]) {
        return new Logger({
            name: `${['kasumi', ...name].join('.')}`,
            streams: [{
                stream: process.stdout,
                level: this.__bunyan_log_level
            }, {
                stream: process.stderr,
                level: this.__bunyan_error_level
            }]
        });
    }
    async connect() {
        let profile = await retry(() => this.API.user.me());
        this.userId = profile.id;
        this.username = profile.username;
        this.identifyNum = profile.identify_num;
        this.logger.info(`Logged in as ${this.username}#${this.identifyNum} (${this.userId})`);
        if (this.__config.type == 'websocket') {
            if (this.__config.vendor == 'botroot') {
                this.websocketBotRoot = new WebSocketSource(this);
                this.websocketBotRoot.connect();
            } else this.websocket = new WebSocket(this);
        } else {
            this.webhook = new WebHook(this.__config, this);
        }
    }
    // on = this.message.on;
    // emit = this.message.emit;
}