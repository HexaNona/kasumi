import Logger from "bunyan";
import { PlainTextMessageEvent, MarkdownMessageEvent, ButtonClickedEvent } from "../../message/type";
import Kasumi from "../..";
import { MethodNotImplementedError } from "../../error";
import BaseSession from "../session";

export type CommandFunction<T, K> = (session: T) => Promise<K>

export default class BaseCommand {
    name: string = 'default';
    usage?: string;
    description?: string;

    logger!: Logger;

    constructor() { }

    func: CommandFunction<BaseSession, any> = async (session: BaseSession) => {
        throw new MethodNotImplementedError();
    }
    async exec(session: BaseSession): Promise<void>;
    async exec(args: string[], event: PlainTextMessageEvent | MarkdownMessageEvent | ButtonClickedEvent, client: Kasumi): Promise<void>;
    async exec(sessionOrArgs: BaseSession | string[], event?: PlainTextMessageEvent | MarkdownMessageEvent | ButtonClickedEvent, client?: Kasumi) {
        if (sessionOrArgs instanceof BaseSession) {
            return this.func(sessionOrArgs).catch((e) => {
                this.logger.error(e);
            })
        } else if (event && client) {
            return this.func(new BaseSession(sessionOrArgs, event, client)).catch((e) => {
                this.logger.error(e);
            })
        } else return this.logger.warn("Executed command with wrong arguments");
    }
}
