import Logger from "bunyan";
import { UnknowInputTypeError } from "../error";
import Kasumi from "..";
import BaseCommand from "./menu/baseCommand";
import BaseMenu from "./menu/baseMenu";
import { MarkdownMessageEvent, PlainTextMessageEvent } from "../message/type";

export default class Plugin {
    private client: Kasumi;
    logger: Logger;
    constructor(client: Kasumi, ...commands: Array<BaseMenu | BaseCommand>) {
        this.client = client;
        this.logger = new Logger({
            name: 'kasumi.plugin',
            streams: [{
                stream: process.stdout,
                level: this.client.__bunyan_log_level
            }, {
                stream: process.stderr,
                level: this.client.__bunyan_error_level
            }]
        });
        this.load(...commands);
    }
    load(...commands: Array<BaseMenu | BaseCommand>) {
        for (const command of commands) {
            if (command instanceof BaseMenu) {
                this.addMenu(command);
            } else if (command instanceof BaseCommand) {
                this.addCommand(command);
            } else {
                throw new UnknowInputTypeError(typeof command, 'BaseMenu | BaseCommand');
            }
        }
    }
    private __menus: {
        [name: string]: BaseMenu
    } = {};
    addMenu(menu: BaseMenu) {
        menu.client = this.client;
        menu.logger = new Logger({
            name: `kasumi.plugin.menu.${menu.name}`,
            streams: [{
                stream: process.stdout,
                level: this.client.__bunyan_log_level
            }, {
                stream: process.stderr,
                level: this.client.__bunyan_error_level
            }]
        });
        menu.init();
        this.__menus[menu.name] = menu;
    }
    private __commands: {
        [name: string]: BaseCommand
    } = {};
    addCommand(command: BaseCommand) {
        command.logger = new Logger({
            name: `kasumi.plugin.command.${command.name}`,
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
        for (const command of commands) {
            content = content.replace(command.trigger, '').trim();
            let args = content.split(' ');
            command.exec(args, event, this.client);
        }
        const menus = Object.values(this.__menus).filter(v => content.startsWith(v.prefix + v.trigger));
        for (const menu of menus) {
            content = content.replace(menu.prefix + menu.trigger, '').trim();
            menu.messageProcessing(content, event);
        }
    }
}