import Logger from "bunyan";
import { UnknowInputTypeError } from "../error";
import Kasumi, { BaseSession, Card } from "..";
import BaseCommand from "./menu/baseCommand";
import BaseMenu from "./menu/baseMenu";
import { MarkdownMessageEvent, PlainTextMessageEvent } from "../message/type";

export default class Plugin {
    private client: Kasumi;
    logger: Logger;
    private prefix: string = './';
    constructor(client: Kasumi, ...commands: Array<BaseMenu | BaseCommand>) {
        this.client = client;
        this.logger = this.client.getLogger('plugin');
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
        menu.logger = this.client.getLogger('plugin', 'menu', menu.name);
        menu.init();
        this.__menus[menu.name] = menu;
    }
    private __commands: {
        [name: string]: BaseCommand
    } = {};
    addCommand(command: BaseCommand) {
        this.logger.debug(`Loading command: ${command.name}`);
        command.logger = this.client.getLogger('plugin', 'command', command.name);
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
    private __get_menu_list() {
        return Object.keys(this.__menus);
    }
    private __get_command_list() {
        return Object.keys(this.__commands);
    }
    messageProcessing(content: string, event: PlainTextMessageEvent | MarkdownMessageEvent) {
        if (content.trim() == `(met)${this.client.me.userId}(met)`) { // Message is "@Bot"
            const session = new BaseSession([], event, this.client);
            const card = new Card()
                .addTitle("命令列表")
                .addDivider();
            const menuList = this.__get_menu_list();
            for (const menuName of menuList) {
                const menu = this.__menus[menuName];
                if (menu && menuName == menu.name) {
                    let text = "";
                    text += `\`\`\`plain\n${this.prefix.charAt(0)}${menu.name}\n\`\`\``;
                    if (menu.description) text += '\n' + menu.description;
                    else text += '\n' + `(font)发送 ${this.prefix.charAt(0)}${menu.name} 查看更多信息(font)[secondary]`;
                    card.addText(text);
                }
            }
            const commandList = this.__get_command_list();
            for (const commandName of commandList) {
                const command = this.__commands[commandName];
                if (command && commandName == command.name) {
                    let text = "";
                    if (command.usage) text += `\`\`\`plain\n${command.usage}\n\`\`\``;
                    else text += `\`\`\`plain\n${this.prefix.charAt(0)}${command.name}\n\`\`\``;
                    if (command.description) text += '\n' + command.description;
                    else text += '\n' + '(font)无介绍(font)[secondary]';
                    card.addText(text);
                }
            }
            session.reply(card)
        }
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