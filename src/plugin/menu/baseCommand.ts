import Logger from "bunyan";
import { PlainTextMessageEvent, MarkdownMessageEvent, ButtonClickedEvent } from "@ksm/message/type"
import Kasumi from "@ksm/client";
import { CommandNameNotPresentErorr, MethodNotImplementedError } from "@ksm/error";
import BaseSession from "@ksm/plugin/session";
import { KasumiMiddleware } from "@ksm/plugin/middlewares/type";
import { AccessControl } from "@ksm/plugin/middlewares/access-control";

export type CommandFunction<T, K> = (session: T) => Promise<K>

export default class BaseCommand<T extends Kasumi<any> = Kasumi> {
    name: string = "";
    protected _finishedInit = false;
    protected client!: T;
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
        this.ready();
    }

    ready() {
        this.use(AccessControl.global.group.middleware)
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
            return this.run(structuredClone(sessionOrArgs)).catch((e) => {
                this.logger.error(e);
            })
        } else if (event && client) {
            return this.run(new BaseSession(sessionOrArgs, event, client)).catch((e) => {
                this.logger.error(e);
            })
        } else return this.logger.warn("Executed command with wrong arguments");
    }

    protected middlewares: KasumiMiddleware[] = [];

    use(...middleware: KasumiMiddleware[]) {
        this.middlewares.push(...middleware);
    }

    protected async run(session: BaseSession): Promise<any> {
        const self = this;
        let currentMiddlewareIndex: number = -1;
        async function next() {
            currentMiddlewareIndex++;
            const currentMiddleware = self.middlewares[currentMiddlewareIndex];
            if (currentMiddleware) {
                const result = await currentMiddleware(session, self).catch((e) => {
                    self.logger.error(`Error running ${self.name} middleware ${currentMiddleware.name}`);
                    self.logger.error(e);
                    return false;
                });
                if (result) await next();
            } else {
                await self.func(session).catch((e) => {
                    self.logger.error(`Error running command ${self.name}`);
                    self.logger.error(e);
                });
            }
        }
        await next();
    }
}
