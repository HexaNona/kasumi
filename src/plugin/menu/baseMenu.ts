import BaseCommand, { CommandFunction } from "./baseCommand";
import Kasumi, { Card } from "../..";
import BaseSession from "../../plugin/session";
import { UnknownInputTypeError } from "../../error";

export default class BaseMenu extends BaseCommand {
    private get promptSequence() {
        return this.loggerSequence;
    }

    constructor(...commands: Array<BaseMenu | BaseCommand>) {
        super();
        this.__raw_commands = commands;
    }

    protected __commands: {
        [name: string]: BaseMenu | BaseCommand;
    } = {};

    private __raw_commands: Array<BaseMenu | BaseCommand>;

    init(client: Kasumi, loggerSequence: string[]) {
        this.client = client;
        this.loggerSequence = loggerSequence;
        this.logger = this.client.getLogger('plugin', ...this.loggerSequence);
        this.load(...this.__raw_commands);
        this._isInit = true;
    }
    load(...commands: Array<BaseMenu | BaseCommand>) {
        for (const command of commands) {
            this.addCommand(command);
        }
    }
    addCommand(command: BaseMenu | BaseCommand) {
        if (command instanceof BaseMenu) {
            this.logger.debug(`Loaded menu: ${command.name}`);
            this.__commands[command.name] = command;
        } else {
            this.logger.debug(`Loaded command: ${command.name}`);
            command.logger = this.client.getLogger('plugin', command.name);
            this.__commands[command.name] = command;
        }
        if (!command.isInit) command.init(this.client, [...this.loggerSequence, command.name]);
    }
    addAlias(command: BaseMenu | BaseCommand, ...aliases: string[]) {
        if (command instanceof BaseCommand) {
            if (!this.__commands[command.name]) this.addCommand(command);
            for (const alias of aliases) {
                if (!this.__commands[alias]) {
                    this.__commands[alias] = command;
                    command.logger.debug(`Loaded alias ${alias}`);
                } else {
                    command.logger.warn(`Duplicated trigger ${alias}`);
                }
            }
        } else throw new UnknownInputTypeError(typeof command, 'BaseMenu | BaseCommand');
    }
    protected get __command_list() {
        return Object.keys(this.__commands)
    }
    func: CommandFunction<BaseSession, void> = async (session) => {
        let splitContent = session.args, command;
        const commandName = Object.keys(this.__commands).find(k => splitContent[0] == k);
        if (commandName && (command = this.__commands[commandName])) {
            command.exec(session.args.splice(1), session.event, session.client);
        } else {
            const card = new Card()
                .addTitle("命令未找到")
                .addDivider();
            const list = this.__command_list;
            if (list.length) {
                card.addText("(font)可用命令(font)[success]");
                for (const commandName of list) {
                    const command = this.__commands[commandName];
                    if (command && commandName == command.name) {
                        let text = `\`\`\`plain\n${this.client.plugin.primaryPrefix}${this.promptSequence.join(" ")} ${command.name}\n\`\`\``;
                        if (command.description) text += '\n' + command.description;
                        else text += '\n' + '(font)无介绍(font)[secondary]';
                        card.addText(text);
                    }
                }
            } else {
                card.addText("(font)菜单下没有可用命令(font)[danger]");
            }
            session.reply(card)
        }
    }
}