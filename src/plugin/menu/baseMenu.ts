import { BaseCommand } from "./baseCommand";
import Kasumi from "@ksm/client";
import { BaseSession } from "@ksm/plugin/session";
import { MethodNotAllowedError, UnknownInputTypeError } from "@ksm/error";

export class BaseMenu extends BaseCommand<Kasumi<any>> {
    readonly type: 'plugin' | 'menu' = 'menu';

    protected get promptSequence() {
        return this.loggerSequence;
    }

    constructor(...commands: Array<BaseMenu | BaseCommand<Kasumi<any>>>) {
        super();
        this.__raw_commands = commands;
    }

    protected __commands: {
        [name: string]: BaseMenu | BaseCommand<Kasumi<any>>;
    } = {};

    protected __raw_commands: Array<BaseMenu | BaseCommand<Kasumi<any>>>;

    init(client: Kasumi<any>, loggerSequence: string[]) {
        this.client = client;
        this.loggerSequence = loggerSequence;
        this.logger = this.client.getLogger('plugin', ...this.loggerSequence);
        this.load(...this.__raw_commands);
        this._finishedInit = true;

        this.emit('ready');
    }
    load(...commands: Array<BaseMenu | BaseCommand<Kasumi<any>>>) {
        for (const command of commands) {
            this.addCommand(command);
        }
    }
    addCommand(command: BaseMenu | BaseCommand<Kasumi<any>>) {
        this._hierachyCacheUpToDate = false;
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
    addAlias(command: BaseMenu | BaseCommand<Kasumi<any>>, ...aliases: string[]) {
        this._hierachyCacheUpToDate = false;
        if (command instanceof BaseCommand) {
            if (!this.__commands[command.name]) this.addCommand(command);
            for (const alias of aliases) {
                if (!this.__commands[alias]) {
                    this.__commands[alias] = command;
                    command.logger.debug(`Loaded alias ${alias}`);
                } else {
                    command.logger.warn(`Duplicated trigger in alias ${alias}`);
                }
            }
        } else throw new UnknownInputTypeError(typeof command, 'BaseMenu | BaseCommand');
    }
    protected get __command_list() {
        return Object.keys(this.__commands)
    }
    async func(session: BaseSession): Promise<void> {
        throw new MethodNotAllowedError('cannot invoke func in BaseMenu');
    }

    menus(): [string, BaseMenu][] {
        return Object.keys(this.__commands).filter((v) => {
            return this.__commands[v].isMenu();
        }).map(v => [v, this.__commands[v] as BaseMenu]);
    }
    commands(): [string, BaseCommand][] {
        return Object.keys(this.__commands).filter((v) => {
            return this.__commands[v].isCommand();
        }).map(v => [v, this.__commands[v]]);
    }

    private _fullHierachyCommands?: { [key: string]: BaseCommand[] } = {};
    private _hierachyCacheUpToDate = false;
    fullHierachyCommands() {
        if (this._hierachyCacheUpToDate && this._fullHierachyCommands) return this._fullHierachyCommands;
        const dfs = (item: BaseMenu, path: [string, BaseCommand][] = []) => {
            const menus = item.menus();
            const commands = item.commands();
            let res: { [key: string]: BaseCommand[] } = {};
            for (const menu of menus) {
                res = {
                    ...res,
                    ...dfs(menu[1], path.concat([menu])),
                    [path.concat([menu]).map(v => v[0]).join(" ")]: Array().concat(this, path.concat([menu]).map(v => v[1]))
                }
            }
            for (const command of commands) {
                res = {
                    ...res,
                    [path.concat([command]).map(v => v[0]).join(" ")]: Array().concat(this, path.concat([command]).map(v => v[1]))
                }
            }
            return res;
        }
        let commands: { [key: string]: BaseCommand[] } = dfs(this);
        this._hierachyCacheUpToDate = true;
        return this._fullHierachyCommands = commands;
    }
}