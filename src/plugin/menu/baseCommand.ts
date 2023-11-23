import Logger from "bunyan";
import { PlainTextMessageEvent, MarkdownMessageEvent, ButtonClickedEvent } from "../../message/type";
import Kasumi from "../../client";
import { MethodNotImplementedError } from "../../error";
import BaseSession from "../session";

export type CommandFunction<T, K> = (session: T) => Promise<K>

export default class BaseCommand<T extends Kasumi = Kasumi> {
    name: string = 'default';
    protected _isInit = false;
    protected client!: T;
    protected loggerSequence: string[] = [];
    get isInit() {
        return this._isInit;
    }
    description?: string;

    logger!: Logger;

    init(client: T, loggerSequence: string[]) {
        this.client = client;
        this.loggerSequence = loggerSequence;
        this.logger = this.client.getLogger(...this.loggerSequence);
        this._isInit = true;
    }

    func: CommandFunction<BaseSession, any> = async () => {
        throw new MethodNotImplementedError();
    }
    async exec(session: BaseSession): Promise<any>;
    async exec(args: string[], event: PlainTextMessageEvent | MarkdownMessageEvent | ButtonClickedEvent, client: Kasumi<any>): Promise<any>;
    async exec(sessionOrArgs: BaseSession | string[], event?: PlainTextMessageEvent | MarkdownMessageEvent | ButtonClickedEvent, client?: Kasumi<any>) {
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
