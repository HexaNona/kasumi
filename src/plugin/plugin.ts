import Logger from "bunyan";
import Kasumi from "@ksm/client";
import { BaseSession } from "./session";
import { BaseCommand } from "./menu/baseCommand";
import { BaseMenu } from "./menu/baseMenu";
import { MarkdownMessageEvent, PlainTextMessageEvent } from "@ksm/message/type";
export class Plugin extends BaseMenu {
    name = '';

    readonly type = 'plugin';

    logger: Logger;
    constructor(client: Kasumi<any>, ...commands: Array<BaseMenu | BaseCommand>) {
        super(...commands)
        this.client = client;
        this.logger = this.client.getLogger('plugin');
        this.load(...commands);
    }

    private prefix: Set<string> = new Set(['/', '.', '!']);
    /**
     * The primary prefix of Kasumi, 
     * which will be displayed on command list
     */
    get primaryPrefix() {
        return this.prefix.values().next().value;
    }
    set primaryPrefix(prefix: string) {
        this.prefix = new Set([prefix, ...this.prefix]);
    }
    /**
     * Add additional prefixes
     * @param prefixes Prefixes to be added
     */
    addPrefix(...prefixes: string[]) {
        prefixes.forEach(v => this.prefix.add(v));
    }
    /**
     * Remove existing prefixes
     * @param prefixes Prefixes to be removed
     */
    removePrefix(...prefixes: string[]) {
        prefixes.forEach(v => this.prefix.delete(v));
    }
    /**
     * Check if a prefix exist
     * @param prefix Prefix to be tested
     * @returns Has the prefix
     */
    hasPrefix(prefix: string) {
        return this.prefix.has(prefix);
    }
    async messageProcessing(content: string, event: PlainTextMessageEvent | MarkdownMessageEvent) {
        content = content.trim();
        let trigger, commands: BaseCommand[], session: BaseSession;
        const prefix = [...this.prefix].find(v => {
            return content.startsWith(v)
        })
        if (prefix) {
            content = content.replace(prefix, '');
            const targetHierachy = Object.entries(this.fullHierachyCommands()).filter(v => {
                if (content.length == v[0].length)
                    return content.startsWith(v[0]);
                else
                    return content.startsWith(v[0] + ' ');
            }).sort((a, b) => {
                return b[0].length - a[0].length;
            })[0];
            if (targetHierachy) {
                [trigger, commands] = targetHierachy;
                content = content.replace(trigger.trim() + ' ', '');
                session = new BaseSession(content.trim().split(" "), event, this.client);

                for (let i = 0; i < commands.length; ++i) {
                    const command = commands[i];
                    const result = await next(command, 0, commands).catch((e) => {
                        this.logger.error(`Error processing middlewares`);
                        this.logger.error(e);
                    });
                    if (!result) break;
                    if (command && !(command instanceof BaseMenu)) {
                        await command.exec(session).catch((e) => {
                            command?.logger.error(`Error running command ${command.hierarchyName}`);
                            command?.logger.error(e);
                        });
                    }
                }

                async function next(command: BaseCommand, currentMiddlewareIndex: number, commands: BaseCommand[]): Promise<boolean> {
                    const currentMiddleware = command.middlewares[currentMiddlewareIndex];
                    if (currentMiddleware) {
                        const result = await currentMiddleware(session, commands).catch((e) => {
                            command.logger.error(`Error running command ${currentMiddleware.name}'s middleware`);
                            command.logger.error(e);
                            return false;
                        });
                        if (result) return await next(command, currentMiddlewareIndex + 1, commands);
                        else return false;
                    } else return true
                }
            }
        }
    }

    /**
     * Set prefix.
     * @param prefix Desired prefixes
     * @deprecated
     */
    setPrefix(prefix: string) {
        this.prefix = new Set(prefix.split(""));
    }
}