import Logger from "bunyan";

import API from "@ksm/api";
import { RawEmisions } from "@ksm/events/type";
import { KasumiConfig } from "@ksm/type";
import { Event } from "@ksm/events";
import { Message } from "@ksm/message";
import WebSocket from "@ksm/websocket";
import { Config } from "@ksm/config";
import WebHook from "@ksm/webhook";
import { Plugin } from "@ksm/plugin/plugin";
import WebSocketSource from "@ksm/websocket-botroot";
import {
    BaseReceiver,
    WebsocketReceiver,
} from "@ksm/websocket-kookts/event-receiver";
import { BaseClient } from "@ksm/websocket-kookts";

import EventEmitter2 from "eventemitter2";
import { TokenNotProvidedError, UnknownConnectionType } from "@ksm/error";
import { MongoDB } from "@ksm/config/database/mongodb";
import * as Middlewares from "@ksm/plugin/middlewares";

export interface Kasumi<CustomStorage extends {}> extends EventEmitter2 {
    on<T extends keyof RawEmisions>(event: T, listener: RawEmisions[T]): this;
    emit<T extends keyof RawEmisions>(
        event: T,
        ...args: Parameters<RawEmisions[T]>
    ): boolean;
}

export class Kasumi<CustomStorage extends {} = {}>
    extends EventEmitter2
    implements Kasumi<CustomStorage>
{
    API: API;
    events: Event;
    message: Message;
    plugin: Plugin;
    config: Config<CustomStorage>;
    websocket?: WebSocket | WebSocketSource | BaseReceiver;
    webhook?: WebHook;
    logger: Logger;

    middlewares = Middlewares;

    /**
     * Profile of the current bot
     */
    me: {
        userId: string;
        username: string;
        identifyNum: string;
        avatar: string;
    } = {
        userId: "",
        username: "",
        identifyNum: "",
        avatar: "",
    };

    readonly TOKEN: string;
    readonly BUNYAN_LOG_LEVEL: Logger.LogLevel;
    readonly BUNYAN_ERROR_LEVEL: Logger.LogLevel;
    readonly DISABLE_SN_ORDER_CHECK: boolean;

    constructor(
        config?: KasumiConfig,
        readFromEnv: boolean = true,
        readFromConfigFile: boolean = true
    ) {
        super({ wildcard: true });
        switch (process.env.LOG_LEVEL?.toLowerCase()) {
            case "verbose":
            case "more":
            case "trace":
                this.BUNYAN_LOG_LEVEL = Logger.TRACE;
                break;
            case "debug":
                this.BUNYAN_LOG_LEVEL = Logger.DEBUG;
                break;
            case "less":
            case "warn":
                this.BUNYAN_LOG_LEVEL = Logger.WARN;
                break;
            default:
                this.BUNYAN_LOG_LEVEL = Logger.INFO;
        }
        switch (process.env.ERROR_LEVEL?.toLowerCase()) {
            case "verbose":
            case "more":
            case "info":
                this.BUNYAN_ERROR_LEVEL = Logger.INFO;
                break;
            case "less":
            case "error":
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

        if (this.config.hasSync("kasumi::config.database")) {
            switch (this.config.getSync("kasumi::config.database")) {
                case "mongodb":
                    MongoDB.builder(this);
                    this.config.syncEssential();
                    break;
            }
        }

        if (!this.config.hasSync("kasumi::config.token"))
            throw new TokenNotProvidedError();
        else this.TOKEN = this.config.getSync("kasumi::config.token");

        if (this.config.hasSync("kasumi::config.disableSnOrderCheck"))
            this.DISABLE_SN_ORDER_CHECK = this.config.getSync(
                "kasumi::config.disableSnOrderCheck"
            );
        else this.DISABLE_SN_ORDER_CHECK = false;

        this.message = new Message(this);

        this.plugin = new Plugin(this);

        this.events = new Event(this);
        this.API = new API(
            this.TOKEN,
            this.getLogger("requestor"),
            this.config.getSync("kasumi::config.customEndpoint")
        );

        this.on("message.text", (event) => {
            this.plugin.messageProcessing(event.content, event).catch((e) => {
                this.plugin.logger.error(e);
            });
        });
    }
    getLogger(...name: string[]) {
        return new Logger({
            name: `${["kasumi", ...name].join(".")}`,
            streams: [
                {
                    stream: process.stdout,
                    level: this.BUNYAN_LOG_LEVEL,
                },
                {
                    stream: process.stderr,
                    level: this.BUNYAN_ERROR_LEVEL,
                },
            ],
        });
    }
    async init() {
        if (
            await this.config.getOne(
                "kasumi::middleware.accessControl.userGroup.enable"
            )
        ) {
            this.middlewares.AccessControl.new(this);
            this.plugin.use(
                this.middlewares.AccessControl.global.group.middleware
            );
        }
        if (
            (await this.config.getOne(
                "kasumi::middleware.commandMenu.enable"
            )) !== false
        ) {
            this.plugin.use(this.middlewares.CommandMenu.middleware);
        }
    }
    async fetchMe() {
        this.config.getSync("kasumi::config.connection");
        const { err, data } = await this.API.user.me();
        if (err) {
            this.logger.error("Getting bot details failed, retrying in 30s");
            setTimeout(() => {
                this.webhook?.close();
                this.connect();
            }, 30 * 1000);
            return false;
        }
        let profile = data;
        this.me.userId = profile.id;
        this.me.username = profile.username;
        this.me.identifyNum = profile.identify_num;
        this.me.avatar = profile.avatar;
        this.logger.info(
            `Logged in as ${this.me.username}#${this.me.identifyNum} (${this.me.userId})`
        );
        return true;
    }
    async connect() {
        if (!(await this.fetchMe())) return;
        await this.init();
        const connection = await this.config.getOne(
            "kasumi::config.connection"
        );
        if (connection == "webhook") {
            this.webhook = new WebHook(this);
            await this.webhook.connect();
        } else {
            const { err } = await this.API.user.offline();
            if (err) throw err;
            switch (connection) {
                case "botroot":
                    this.websocket = new WebSocketSource(this, false);
                    await this.websocket.connect();
                    break;
                case "kookts":
                    this.websocket = new WebsocketReceiver(
                        new BaseClient(this)
                    );
                    await this.websocket.connect();
                    break;
                case "kasumi":
                case "builtin":
                case "salt":
                case "hexona":
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
