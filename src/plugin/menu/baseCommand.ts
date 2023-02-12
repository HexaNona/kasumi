import Logger from "bunyan";
import { PlainTextMessageEvent, MarkdownMessageEvent } from "../../message/type";
import Kasumi from "../..";
import { MethodNotImplementedError } from "../../error";
import BaseSession from "../session";

export type CommandFunction<T extends any, K extends any> = (session: T) => Promise<K>

export default class BaseCommand {
    name: string = 'default';

    trigger: string = 'default';

    logger!: Logger;

    constructor() { }

    func: CommandFunction<BaseSession, void> = async (session: BaseSession) => {
        throw new MethodNotImplementedError();
    }
    async exec(args: string[], event: PlainTextMessageEvent | MarkdownMessageEvent, client: Kasumi): Promise<void> {
        return this.func(new BaseSession(args, event, client));
    }
}
