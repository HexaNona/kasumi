import type { DefiniteStorage, Storage, StorageItem } from './type';
import * as fs from 'fs';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { WebHookSafeConfig } from '../webhook/type';
import { KasumiConfig } from '../type';
import { Database } from './database';

dotenvExpand.expand(dotenv.config());

type StringKeyOf<T extends object> = Extract<keyof T, string>;

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

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

    private _map: Map<string, StorageItem> = new Map();
    public get map() {
        return this._map;
    }

    public database?: Database;
    private hasDatabase(): this is { database: Database } {
        return this._hasDatabase;
    }
    public set _hasDatabase(payload: boolean) {
        this.__hasDatabase = payload;
    }
    private __hasDatabase: boolean;
    constructor() {
        this.set('kasumi::disableSnOrderCheck', false);
        this.__hasDatabase = false;
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
        this.set('kasumi::token', config.token)
            .set('kasumi::disableSnOrderCheck', config.disableSnOrderCheck || false)
        if (config.type == 'websocket') {
            this.set('kasumi::connection', config.vendor || 'hexona');
        } else {
            this.set('kasumi::connection', config.type)
                .set('kasumi::webhookVerifyToken', config.verifyToken)
                .set('kasumi::webhookEncryptKey', config.encryptKey)
                .set('kasumi::webhookPort', config.port);
        }
    }
    public async syncEssential() {
        if ((await this.get("kasumi::connection", "kasumi::disableSnOrderCheck", "kasumi::token"))['kasumi::connection'] == 'webhook') {
            await this.get("kasumi::webhookEncryptKey", "kasumi::webhookVerifyToken", "kasumi::webhookPort");
        }
    }
    public loadEnvironment() {
        if (process.env.TOKEN) this.set("kasumi::token", process.env.TOKEN);
        if (process.env.CONNECTION) {
            const connection = process.env.CONNECTION.toLowerCase();
            if (Config.isConnectionMode(connection)) this.set("kasumi::connection", connection);
        }
        if (process.env.VERIFY_TOKEN) this.set("kasumi::webhookVerifyToken", process.env.VERIFY_TOKEN);
        if (process.env.ENCRYPT_KEY) this.set("kasumi::webhookEncryptKey", process.env.ENCRYPT_KEY);
        if (process.env.PORT) this.set("kasumi::webhookPort", parseInt(process.env.PORT));
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
        return this.hasSync('kasumi::token') &&
            this.hasSync('kasumi::webhookVerifyToken') &&
            this.hasSync('kasumi::webhookEncryptKey') &&
            this.hasSync('kasumi::webhookPort');
    }

    public static isConnectionMode(payload?: string): payload is 'webhook' | 'hexona' | 'kookts' | 'botroot' {
        return payload == 'webhook' || payload == 'hexona' || payload == 'kookts' || payload == 'botroot'
    }
}