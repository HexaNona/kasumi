import BaseCommand from "./baseCommand";
import Logger from "bunyan";
import Kasumi from "../..";
import BaseSession from "../../plugin/session";
import { PlainTextMessageEvent, MarkdownMessageEvent } from "../../message/type";

export default class BaseMenu {
    name: string = 'default';

    prefix: string = '/';
    trigger: string = 'default';

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
        command.logger = new Logger({
            name: `kasumi.plugin.menu.${this.name}.${command.name}`,
            streams: [{
                stream: process.stdout,
                level: this.client.__bunyan_log_level
            }, {
                stream: process.stderr,
                level: this.client.__bunyan_error_level
            }]
        });
        this.__commands[command.name] = command;
    }
    messageProcessing(content: string, event: PlainTextMessageEvent | MarkdownMessageEvent) {
        const commands = Object.values(this.__commands).filter(v => content.startsWith(v.trigger));
        if (commands.length) {
            for (const command of commands) {
                content = content.replace(command.trigger, '').trim();
                let args = content.split(' ');
                this.__commands[command.trigger].exec(args, event, this.client);
            }
        } else {
            const session = new BaseSession([], event, this.client);
            session.reply('Command not found!' + Object.keys(this.__commands).join(','));
        }
    }
}