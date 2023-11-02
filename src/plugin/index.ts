import Logger from "bunyan";
import Kasumi from "../client";
import BaseSession from "./session";
import Card from "../card";
import BaseCommand, { CommandFunction } from "./menu/baseCommand";
import BaseMenu from "./menu/baseMenu";
import { MarkdownMessageEvent, PlainTextMessageEvent } from "../message/type";
import { MethodNotImplementedError } from "../error";

export default class Plugin extends BaseMenu {
    name = '';
    logger: Logger;
    constructor(client: Kasumi, ...commands: Array<BaseMenu | BaseCommand>) {
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
    messageProcessing(content: string, event: PlainTextMessageEvent | MarkdownMessageEvent) {
        if (content.trim() == `(met)${this.client.me.userId}(met)`) { // Message is "@Bot"
            const session = new BaseSession([], event, this.client);
            const card = new Card()
                .addTitle("命令列表")
                .addDivider();
            const commandList = this.__command_list;
            for (const commandName of commandList) {
                const command = this.__commands[commandName];
                if (command && commandName == command.name) {
                    let text = `\`\`\`plain\n${this.prefix.keys().next().value}${command.name}\n\`\`\``;
                    if (command.description) text += '\n' + command.description;
                    else text += '\n' + '(font)无介绍(font)[secondary]';
                    card.addText(text);
                }
            }
            return session.reply(card)
        } else {
            const session = new BaseSession(content.split(" "), event, this.client);
            const commandName = Object.keys(this.__commands).find(k => {
                const prefix = [...this.prefix].find(v => content.startsWith(v))
                return session.args[0] == prefix + k;
            });
            let command
            if (commandName && (command = this.__commands[commandName])) {
                command.exec(session.args.splice(1), session.event, session.client);
            }
        }
    }
    func: CommandFunction<BaseSession, any> = async () => {
        throw new MethodNotImplementedError();
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