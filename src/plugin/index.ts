import Logger from "bunyan";
import { UnknowInputTypeError } from "../error";
import Kasumi from "..";
import BaseCommand from "./menu/baseCommand";
import BaseMenu from "./menu/baseMenu";
import { MarkdownMessageEvent, PlainTextMessageEvent } from "../message/type";

export default class Plugin {
    private client: Kasumi;
    logger: Logger;
    private prefix: string = './';
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
        this.logger.debug(`Loading menu: ${menu.name}`);
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
        this.logger.debug(`Loading command: ${command.name}`);
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
    setPrefix(prefix: string) {
        this.prefix = prefix;
    }
    addAlias(command: BaseMenu | BaseCommand, ...aliases: string[]) {
        if (command instanceof BaseCommand) {
            if (!this.__commands[command.name]) this.addCommand(command);
            for (const alias of aliases) {
                this.__commands[alias] = command;
            }
        } else if (command instanceof BaseMenu) {
            if (!this.__menus[command.name]) this.addMenu(command)
            for (const alias of aliases) {
                this.__menus[alias] = command;
            }
        } else throw new UnknowInputTypeError(typeof command, 'BaseMenu | BaseCommand');
    }
    messageProcessing(content: string, event: PlainTextMessageEvent | MarkdownMessageEvent) {
        let splitContent = content ? content.split(' ') : [];
        const commands = Object.keys(this.__commands).filter(k => {
            let prefixIdx;
            if ((prefixIdx = this.prefix.indexOf(content.charAt(0))) != undefined) {
                let prefix = this.prefix[prefixIdx];
                return splitContent[0] == prefix + k;
            } else return false;
        });
        for (const key of commands) {
            const command = this.__commands[key];
            if (command) {
                let processedContent = content.slice(1).replace(key, '').trim();
                let args = processedContent ? processedContent.split(' ') : [];
                command.exec(args, event, this.client);
            }
        }
        const menus = Object.keys(this.__menus).filter(k => {
            let prefixIdx;
            let v = this.__menus[k];
            if ((prefixIdx = v.prefix.indexOf(content.charAt(0))) != undefined) {
                let prefix = v.prefix[prefixIdx];
                return splitContent[0] == prefix + k
            } else return false;
        });
        for (const key of menus) {
            const menu = this.__menus[key];
            if (menu) {
                let processedContent = content.slice(1).replace(key, '').trim();
                menu.messageProcessing(processedContent, event);
            }
        }
    }
}