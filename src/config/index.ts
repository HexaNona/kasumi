import type { DefiniteStorage, Storage } from './type';
import * as fs from 'fs';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { WebHookSafeConfig } from '../webhook/type';
import { KasumiConfig } from '../type';
dotenv.config();
dotenvExpand.expand();

export default class Config extends Map<string | number, any> {
    private file: any;
    constructor() {
        super();
        this.set('disableSnOrderCheck', false);
    }
    public loadConfigFile(inputPath?: string) {
        const configPath = process.env.CONFIG_PATH;
        const path = inputPath || configPath;
        if (path) {
            if (fs.existsSync(path)) {
                this.file = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
                for (const key in this.file) {
                    this.set(key, this.file[key]);
                }
            }
        }
    }
    public loadConifg(config: KasumiConfig) {
        this.set('token', config.token)
            .set('disableSnOrderCheck', config.disableSnOrderCheck || false)
        if (config.type == 'websocket') {
            this.set('connection', config.vendor || 'hexona');
        } else {
            this.set('connection', config.type)
                .set('webhookVerifyToken', config.verifyToken)
                .set('webhookEncryptKey', config.encryptKey)
                .set('webhookPort', config.port);
        }
    }
    public loadEnvironment() {
        if (process.env.TOKEN) this.set("token", process.env.TOKEN);
        if (process.env.CONNECTION) {
            const connection = process.env.CONNECTION.toLowerCase();
            if (Config.isConnectionMode(connection)) this.set("connection", connection);
        }
        if (process.env.VERIFY_TOKEN) this.set("webhookVerifyToken", process.env.VERIFY_TOKEN);
        if (process.env.ENCRYPT_KEY) this.set("webhookEncryptKey", process.env.ENCRYPT_KEY);
        if (process.env.PORT) this.set("webhookPort", parseInt(process.env.PORT));
    }
    public has<T extends keyof DefiniteStorage, K extends keyof Storage>(key: T | K): this is { get(key: T | K): Storage[T | K] } & this {
        return super.has(key);
    }
    public get<T extends keyof DefiniteStorage, K extends keyof Storage>(key: T | K): Partial<Storage>[T | K] {
        return super.get(key);
    }
    public set<T extends keyof DefiniteStorage, K extends keyof Storage>(key: T | K, value: Storage[T | K]) {
        return super.set(key, value);
    }

    public isWebHookSafe(): this is WebHookSafeConfig {
        return this.has('token') &&
            this.has('webhookVerifyToken') &&
            this.has('webhookEncryptKey') &&
            this.has('webhookPort');
    }

    public static isConnectionMode(payload?: string): payload is 'webhook' | 'hexona' | 'kookts' | 'botroot' {
        return payload == 'webhook' || payload == 'hexona' || payload == 'kookts' || payload == 'botroot'
    }
}