import type { DefiniteStorage, Storage, StorageItem } from './type';
import * as fs from 'fs';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { WebHookSafeConfig } from '../webhook/type';
import { KasumiConfig } from '../type';
import { Database } from './database';

dotenvExpand.expand(dotenv.config());

type StringKeyOf<T extends object> = Extract<keyof T, string>;

type Equals<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? true : false;

/**
 * Combine T and K only T is not equal to Q
 * 
 * Otherwise K will be returned
 */
type CombineOnlyWhenNotEqual<T, K, Q> = Equals<T, Q> extends true ? K : T | K

export default class Config {
    private file: any;

    private map: Map<string, StorageItem> = new Map();

    protected database?: Database;
    private hasDatabase(): this is { database: Database } {
        return this._hasDatabase;
    }
    private _hasDatabase: boolean;

    public initDatabase(database: Database) {
        if (database) {
            this.database = database;
            this.database.sync(Object.fromEntries(this.map.entries()));
            this._hasDatabase = true;
        }
    }

    constructor() {
        this.set('kasumi::config.disableSnOrderCheck', false);
        this._hasDatabase = false;
    }
    public loadConfigFile(inputPath?: string) {
        const configPath = process.env.CONFIG_PATH;
        const path = inputPath || configPath;
        if (path) {
            if (fs.existsSync(path)) {
                this.file = require(path);
                for (const key in this.file) {
                    this.set(key, this.file[key]);
                }
            }
        }
    }
    public loadConifg(config: KasumiConfig) {
        this.set('kasumi::config.token', config.token)
            .set('kasumi::config.disableSnOrderCheck', config.disableSnOrderCheck || false)
        if (config.type == 'websocket') {
            this.set('kasumi::config.connection', config.vendor || 'hexona');
        } else {
            this.set('kasumi::config.connection', config.type)
                .set('kasumi::config.webhookVerifyToken', config.verifyToken)
                .set('kasumi::config.webhookEncryptKey', config.encryptKey)
                .set('kasumi::config.webhookPort', config.port);
        }
    }
    public async syncEssential() {
        if ((await this.get("kasumi::config.connection", "kasumi::config.disableSnOrderCheck", "kasumi::config.token"))['kasumi::config.connection'] == 'webhook') {
            await this.get("kasumi::config.webhookEncryptKey", "kasumi::config.webhookVerifyToken", "kasumi::config.webhookPort");
        }
    }
    public loadEnvironment() {
        if (process.env.TOKEN) this.set("kasumi::config.token", process.env.TOKEN);
        if (process.env.CONNECTION) {
            const connection = process.env.CONNECTION.toLowerCase();
            if (Config.isConnectionMode(connection)) this.set("kasumi::config.connection", connection);
        }
        if (process.env.VERIFY_TOKEN) this.set("kasumi::config.webhookVerifyToken", process.env.VERIFY_TOKEN);
        if (process.env.ENCRYPT_KEY) this.set("kasumi::config.webhookEncryptKey", process.env.ENCRYPT_KEY);
        if (process.env.PORT) this.set("kasumi::config.webhookPort", parseInt(process.env.PORT));
    }
    public hasSync<T extends StringKeyOf<DefiniteStorage>, K extends StringKeyOf<Storage>>(key: T | K): boolean {
        return this.map.has(key);
    }
    public getSync<T extends StringKeyOf<DefiniteStorage>, K extends StringKeyOf<Storage>>(key: T | K): Storage[T | K] {
        return (this.map.get(key) || "") as any;
    }

    public async getOne<T extends StringKeyOf<DefiniteStorage>, K extends StringKeyOf<Storage>>(key: T | K): Promise<Storage[T | K]> {
        return (await this.get(key))[key] as any;
    }

    public async get<T extends StringKeyOf<DefiniteStorage>, K extends StringKeyOf<Storage>>(...keys: (T | K)[]): Promise<{
        [key in CombineOnlyWhenNotEqual<T, K, StringKeyOf<DefiniteStorage>>]: Storage[(T | K)];
    }> {
        let res: {
            [key in (T | K)]?: StorageItem;
        } = {};
        const getQueue: (T | K)[] = [];
        for (const key of keys) {
            if (this.map.has(key)) res[key] = this.map.get(key);
            else {
                getQueue.push(key);
            }
        }

        if (this.hasDatabase()) {
            res = {
                ...res,
                ...await this.database.get(...getQueue)
            }
        } else {
            res = {
                ...res,
                ...Object.fromEntries(getQueue.map(v => {
                    return [v, ""]
                }))
            }
        }
        return res as any;
    }
    public set<T extends StringKeyOf<DefiniteStorage>, K extends StringKeyOf<Storage>>(key: T | K, value: Storage[T | K]) {
        this.map.set(key, value);
        if (this.hasDatabase()) this.database.addToSetQueue(key, value);
        return this;
    }

    public isWebHookSafe(): this is WebHookSafeConfig {
        return this.hasSync('kasumi::config.token') &&
            this.hasSync('kasumi::config.webhookVerifyToken') &&
            this.hasSync('kasumi::config.webhookEncryptKey') &&
            this.hasSync('kasumi::config.webhookPort');
    }

    public static isConnectionMode(payload?: string): payload is 'webhook' | 'hexona' | 'kookts' | 'botroot' {
        return payload == 'webhook' || payload == 'hexona' || payload == 'kookts' || payload == 'botroot'
    }
}