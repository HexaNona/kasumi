import Logger from "bunyan";
import { PlainTextMessageEvent, MarkdownMessageEvent, ButtonClickedEvent } from "@ksm/message/type"
import Kasumi from "@ksm/client";
import { CommandNameNotPresentErorr, MethodNotImplementedError } from "@ksm/error";
import BaseSession from "@ksm/plugin/session";
import { KasumiMiddleware } from "@ksm/plugin/middlewares/type";
import Plugin from "..";
import BaseMenu from "./baseMenu";
import crypto from 'crypto';
import hash from 'object-hash';
import EventEmitter2 from "eventemitter2";

export type CommandFunction<T, K> = (session: T) => Promise<K>

interface CommandEvents {
    ready: () => void;
    exec: (session: BaseSession) => Promise<void> | void;
}

export interface BaseCommand extends EventEmitter2 {
    on<T extends keyof CommandEvents>(event: T, listener: CommandEvents[T]): this;
    emit<T extends keyof CommandEvents>(event: T, ...args: Parameters<CommandEvents[T]>): boolean;
}

export class BaseCommand<T extends Kasumi<any> = Kasumi<any>> extends EventEmitter2 {
    readonly UUID = crypto.randomUUID();
    hashCode() {
        return hash(this.toJSON(), { algorithm: 'sha256', encoding: 'hex', ignoreUnknown: true });
    }

    toJSON() {
        return {
            name: this.name,
            hierarchyName: this.hierarchyName,
            type: this.type,
            description: this.description,
            middlewareCount: this.middlewares.length
        }
    }

    name: string = "";

    readonly type: 'plugin' | 'menu' | 'command' = 'command';
    protected _finishedInit = false;
    client!: T;
    protected loggerSequence: string[] = [];
    get isInit() {
        return this._finishedInit;
    }
    description?: string;

    logger!: Logger;

    init(client: T, loggerSequence: string[]) {
        if (!this.name) throw new CommandNameNotPresentErorr()
        this.client = client;
        this.loggerSequence = loggerSequence;
        this.logger = this.client.getLogger(...this.loggerSequence);
        this._finishedInit = true;

        this.emit('ready');
    }

    get hierarchyName() {
        return this.loggerSequence.join(' ');
    }

    async func(session: BaseSession): Promise<any> {
        throw new MethodNotImplementedError();
    }
    async exec(session: BaseSession): Promise<any>;
    async exec(args: string[], event: PlainTextMessageEvent | MarkdownMessageEvent | ButtonClickedEvent, client: Kasumi<any>): Promise<any>;
    async exec(sessionOrArgs: BaseSession | string[], event?: PlainTextMessageEvent | MarkdownMessageEvent | ButtonClickedEvent, client?: Kasumi<any>) {
        if (sessionOrArgs instanceof BaseSession) {
            this.emit('exec', sessionOrArgs);
            return this.run(sessionOrArgs).catch((e) => {
                this.logger.error(e);
            })
        } else if (event && client) {
            this.emit('exec', new BaseSession(sessionOrArgs, event, client));
            return this.run(new BaseSession(sessionOrArgs, event, client)).catch((e) => {
                this.logger.error(e);
            })
        } else return this.logger.warn("Executed command with wrong arguments");
    }

    protected _middlewares: KasumiMiddleware[] = [];

    get middlewares() { return [...this._middlewares] }

    use(...middleware: KasumiMiddleware[]) {
        this._middlewares.push(...middleware);
    }

    protected async run(session: BaseSession): Promise<any> {
        return this.func(session);
    }

    isPlugin(): this is Plugin {
        return this.type == 'plugin';
    }
    isMenu(): this is BaseMenu {
        return this.type == 'menu';
    }
    isCommand(): this is BaseCommand {
        return this.type == 'command';
    }
}

export default BaseCommand;