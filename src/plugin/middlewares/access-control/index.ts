import Kasumi from '@ksm/client';
import { BreifUser } from "@ksm/type";
import { KasumiMiddleware } from '@ksm/plugin/middlewares/type';
import { BaseCommand } from '@ksm/plugin/menu/baseCommand';

export class AccessControl {
    private client: Kasumi<any>;

    constructor(client: Kasumi<any>) {
        this.client = client;

        this.group = new AccessControl.UserGroup(this.client);
    }

    group: AccessControl.UserGroup;

    private static globalInstance: AccessControl;
    static new(client: Kasumi<any>) {
        return this.globalInstance = new AccessControl(client);
    }
    static get global() {
        return this.globalInstance;
    }
}

export namespace AccessControl {
    export class UserGroup {
        static Admin = {
            name: 'Admin',
            level: 999999
        };
        static User = {
            name: 'User',
            level: 100
        }

        private client: Kasumi<UserGroup.KasumiConfig>;
        private userGroups: Map<string, UserGroup.Pattern> = new Map();

        private _defaultUserGroup: UserGroup.Pattern = UserGroup.User;
        private set defaultUserGroup(payload: UserGroup.Pattern) { this._defaultUserGroup = payload; }
        get defaultUserGroup() { return this._defaultUserGroup }

        private _defaultCommandLevel: number = UserGroup.User.level;
        private set defaultCommandLevel(payload: number) { this._defaultCommandLevel = payload; }
        get defaultCommandLevel() { return this._defaultCommandLevel }

        constructor(client: Kasumi<any>) {
            this.client = client;
            this.set(UserGroup.Admin, UserGroup.User);
        }
        set(...groups: UserGroup.Pattern[]) {
            groups.forEach(v => this.userGroups.set(v.name, v));
        }
        get(name: string) {
            return this.userGroups.get(name);
        }

        private _enabled = false;
        get isEnabled() { return this._enabled; }
        enable() { this._enabled = true; }
        disable() { this._enabled = false; }

        /**
         * Assign a group to a user
         * @param user User ID
         * @param group The group to assign to the user
         */
        assignUser(user: string, group?: AccessControl.UserGroup.Pattern) {
            this.client.config.set(`kasumi::middleware.accessControl.userGroup.user.${user}`, group)
        }
        async getUser(user: BreifUser) {
            const group = await this.client.config.getOne(`kasumi::middleware.accessControl.userGroup.user.${user.id}`);
            return group || this.defaultUserGroup;
        }

        private levels: Map<string, number> = new Map();

        private getCommandIdentifier(command: BaseCommand) {
            return command.hashCode();
        }

        async getCommandLevel(command: BaseCommand): Promise<number> {
            return (await this.client.config.getOne(`kasumi::middleware.accessControl.userGroup.command.${this.getCommandIdentifier(command)}`)).level || this.defaultCommandLevel;
        }
        setCommandLevel(command: BaseCommand, level: number) {
            this.client.config.set(`kasumi::middleware.accessControl.userGroup.command.${this.getCommandIdentifier(command)}`, {
                name: command.hierarchyName,
                level
            })
            return this;
        }

        middleware: KasumiMiddleware = async (session, commands) => {
            const level = (await Promise.all(commands.map(v => this.getCommandLevel(v)))).sort((a, b) => { return b - a }).at(0) || this.defaultCommandLevel;
            const userGroup = await this.getUser(session.author);
            if (userGroup.level >= level) return true;
            else {
                await session.reply(`您所在的权限组（${userGroup.name}）无法使用此命令！`);
                return false;
            }
        }
    }
    export namespace UserGroup {
        export interface KasumiConfig {
            [key: `kasumi::middleware.accessControl.userGroup.user.${string}`]: UserGroup.Pattern;
            [key: `kasumi::middleware.accessControl.userGroup.command.${string}`]: UserGroup.Pattern;
        }
        export interface Pattern {
            name: string,
            level: number
        }
    }
}