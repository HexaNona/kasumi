import Logger from "bunyan";

import API from "./api";
import { RawEmisions } from './event';
import { KasumiConfig } from "./type";
import Message from "./message";
import WebSocket from "./websocket";
import Config from "./config";
import WebHook from "./webhook";
import Plugin from "./plugin"
import WebSocketSource from "./websocket-botroot";
import { BaseReceiver, WebsocketReceiver } from "./websocket-kookts/event-receiver";
import { BaseClient } from "./websocket-kookts";

import EventEmitter2 from "eventemitter2";
import { TokenNotProvidedError, UnknownConnectionType, UnknownInputTypeError } from "./error";
import { MongoDB } from "./config/database/mongodb";
export { default as BaseMenu } from "./plugin/menu/baseMenu";
export { default as BaseCommand, CommandFunction } from "./plugin/menu/baseCommand";
export { default as BaseSession } from "./plugin/session";
export { default as Card } from './card';

export * from './message/type';
export * from './type';

export interface Kasumi extends EventEmitter2 {
    on<T extends keyof RawEmisions>(event: T, listener: RawEmisions[T]): this;
    emit<T extends keyof RawEmisions>(event: T, ...args: Parameters<RawEmisions[T]>): boolean;
}

export class Kasumi extends EventEmitter2 implements Kasumi {
    API: API;
    message: Message;
    plugin: Plugin;
    config: Config;
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

    constructor(config?: KasumiConfig, readFromEnv: boolean = true, readFromConfigFile: boolean = true) {
        super({ wildcard: true });
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

        this.config = new Config();
        if (config) this.config.loadConifg(config);
        if (readFromConfigFile) this.config.loadConfigFile();
        if (readFromEnv) this.config.loadEnvironment();

        if (!this.config.hasSync('kasumi::token')) throw new TokenNotProvidedError();
        else this.TOKEN = this.config.getSync('kasumi::token');

        if (this.config.hasSync('kasumi::disableSnOrderCheck')) this.DISABLE_SN_ORDER_CHECK = this.config.getSync('kasumi::disableSnOrderCheck');
        else this.DISABLE_SN_ORDER_CHECK = false;

        if (this.config.hasSync('kasumi::database')) {
            switch (this.config.getSync('kasumi::database')) {
                case 'mongodb':
                    MongoDB.init(this.config);
                    break;
            }
        }

        this.message = new Message(this);
        this.plugin = new Plugin(this);
        this.API = new API(this.TOKEN, this.getLogger('requestor'));

        this.on('message.text', (event) => {
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
        const connection = (await this.config.getOne('kasumi::connection'));
        if (connection == 'webhook') {
            this.webhook = new WebHook(this);
        } else {
            const { err } = await this.API.user.offline();
            if (err) throw err;
            switch (connection) {
                case 'botroot':
                    this.websocket = new WebSocketSource(this, false);
                    this.websocket.connect();
                    break;
                case 'kookts':
                    this.websocket = new WebsocketReceiver(new BaseClient(this));
                    this.websocket.connect();
                    break;
                case 'hexona':
                    this.websocket = new WebSocket(this);
                    break;
                default:
                    throw new UnknownConnectionType(connection);
            }
        }
    }
    // on = this.message.on;
    // emit = this.message.emit;
}

export default Kasumi;