import BaseCommand from "./baseCommand";
import Logger from "bunyan";
import Kasumi, { Card } from "../..";
import BaseSession from "../../plugin/session";
import { PlainTextMessageEvent, MarkdownMessageEvent } from "../../message/type";
import { UnknowInputTypeError } from "../../error";

export default class BaseMenu {
    name: string = 'default';
    description?: string

    prefix: string = '/';

    client!: Kasumi;
    logger!: Logger;

    private __commands: {
        [name: string]: BaseCommand;
    } = {};

    private __raw_commands: BaseCommand[];

    constructor(...commands: BaseCommand[]) {
        this.__raw_commands = commands;
    }
    init() {
        this.load(...this.__raw_commands);
    }
    load(...commands: BaseCommand[]) {
        for (const command of commands) {
            this.addCommand(command);
        }
    }
    addCommand(command: BaseCommand) {
        this.logger.debug(`Loading command: ${command.name}`);
        command.logger = this.client.getLogger('plugin', 'menu', this.name, command.name);
        this.__commands[command.name] = command;
    }
    addAlias(command: BaseCommand, ...aliases: string[]) {
        if (command instanceof BaseCommand) {
            if (!this.__commands[command.name]) this.addCommand(command);
            for (const alias of aliases) {
                this.__commands[alias] = command;
            }
        } else throw new UnknowInputTypeError(typeof command, 'BaseMenu | BaseCommand');
    }
    private __get_command_list() {
        return Object.keys(this.__commands)
    }
    messageProcessing(content: string, event: PlainTextMessageEvent | MarkdownMessageEvent) {
        let splitContent = content ? content.split(' ') : [];
        const commands = Object.keys(this.__commands).filter(k => splitContent[0] == k);
        if (commands.length) {
            for (const key of commands) {
                const command = this.__commands[key];
                if (command) {
                    let processedContent = content.replace(key, '').trim();
                    let args = processedContent ? processedContent.split(' ') : [];
                    command.exec(args, event, this.client);
                }
            }
        } else {
            const session = new BaseSession([], event, this.client);
            const card = new Card()
                .addTitle("命令未找到")
                .addDivider()
                .addText("(font)可用命令(font)[success]");
            const list = this.__get_command_list();
            for (const commandName of list) {
                const command = this.__commands[commandName];
                if (command && commandName == command.name) {
                    let text = "";
                    if (command.usage) text += `\`\`\`plain\n${command.usage}\n\`\`\``;
                    else text += `\`\`\`plain\n${this.prefix.charAt(0)}${this.name} ${command.name}\n\`\`\``;
                    if (command.description) text += '\n' + command.description;
                    else text += '\n' + '(font)无介绍(font)[secondary]';
                    card.addText(text);
                }
            }
            session.reply(card)
        }
    }
}