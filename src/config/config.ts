import type {
    DefiniteStorage,
    ExtractProperty,
    GenericStorage,
    StorageItem,
    StringKeyOf,
} from "./type";
import * as fs from "fs";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { KasumiConfig } from "@ksm/type";
import { Database } from "./database";
import JSON5 from "json5";

dotenvExpand.expand(dotenv.config());

export class Config<CustomStorage extends {}> {
    static join(namespace: string, ...keys: string[]) {
        return `${namespace}::${keys.join(".")}`;
    }
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
        this.set("kasumi::config.disableSnOrderCheck", false);
        this._hasDatabase = false;
    }
    public loadConfigFile(inputPath?: string) {
        const configPath = process.env.CONFIG_PATH;
        const path = inputPath || configPath;
        if (path) {
            if (fs.existsSync(path)) {
                const data = fs.readFileSync(path, { encoding: "utf-8" });
                this.file = JSON5.parse(data);
                for (const key in this.file) {
                    this.set(key, this.file[key]);
                }
            }
        }
    }
    public loadConifg(config: KasumiConfig) {
        this.set("kasumi::config.token", config.token);
        if (config.disableSnOrderCheck)
            this.set(
                "kasumi::config.disableSnOrderCheck",
                config.disableSnOrderCheck
            );
        if (config.customEnpoint)
            this.set("kasumi::config.customEndpoint", config.customEnpoint);
        if (config.type == "websocket") {
            this.set("kasumi::config.connection", config.vendor || "hexona");
        } else {
            this.set("kasumi::config.connection", config.type)
                .set("kasumi::config.webhookVerifyToken", config.verifyToken)
                .set("kasumi::config.webhookEncryptKey", config.encryptKey)
                .set("kasumi::config.webhookPort", config.port);
        }
    }
    public async syncEssential() {
        if (
            (
                await this.get(
                    "kasumi::config.connection",
                    "kasumi::config.disableSnOrderCheck",
                    "kasumi::config.token"
                )
            )["kasumi::config.connection"] == "webhook"
        ) {
            await this.get(
                "kasumi::config.webhookEncryptKey",
                "kasumi::config.webhookVerifyToken",
                "kasumi::config.webhookPort"
            );
        }
    }
    public loadEnvironment() {
        if (process.env.TOKEN)
            this.set("kasumi::config.token", process.env.TOKEN);
        if (process.env.CONNECTION) {
            const connection = process.env.CONNECTION.toLowerCase();
            if (Config.isConnectionMode(connection))
                this.set("kasumi::config.connection", connection);
        }
        if (process.env.VERIFY_TOKEN)
            this.set(
                "kasumi::config.webhookVerifyToken",
                process.env.VERIFY_TOKEN
            );
        if (process.env.ENCRYPT_KEY)
            this.set(
                "kasumi::config.webhookEncryptKey",
                process.env.ENCRYPT_KEY
            );
        if (process.env.PORT)
            this.set("kasumi::config.webhookPort", parseInt(process.env.PORT));
    }
    public hasSync<P extends StringKeyOf<CustomStorage>>(
        key: P
    ): this is {
        getSync(key: P): NonNullable<ExtractProperty<P, CustomStorage>>;
    } & this;
    public hasSync<T extends StringKeyOf<DefiniteStorage>>(
        key: T
    ): this is {
        getSync(key: T): NonNullable<ExtractProperty<T, DefiniteStorage>>;
    } & this;
    public hasSync<K extends StringKeyOf<GenericStorage>>(
        key: K
    ): this is { getSync(key: K): StorageItem } & this;
    public hasSync(key: string) {
        return this.map.has(key);
    }
    public getSync<P extends StringKeyOf<CustomStorage>>(
        key: P
    ): ExtractProperty<P, CustomStorage>;
    public getSync<T extends StringKeyOf<DefiniteStorage>>(
        key: T
    ): ExtractProperty<T, DefiniteStorage>;
    public getSync<K extends StringKeyOf<GenericStorage>>(
        key: K
    ): StorageItem | undefined;
    public getSync(key: string) {
        return this.map.get(key);
    }

    public async getOne<P extends StringKeyOf<CustomStorage>>(
        key: P
    ): Promise<ExtractProperty<P, CustomStorage>>;
    public async getOne<T extends StringKeyOf<DefiniteStorage>>(
        key: T
    ): Promise<ExtractProperty<T, DefiniteStorage>>;
    public async getOne<K extends StringKeyOf<GenericStorage>>(
        key: K
    ): Promise<StorageItem | undefined>;
    public async getOne(key: string) {
        // @ts-expect-error
        return (await this.get(key))[key];
    }

    public async get<
        T extends StringKeyOf<DefiniteStorage>,
        P extends StringKeyOf<CustomStorage>,
        K extends StringKeyOf<GenericStorage>,
    >(
        ...keys: (T | P | K)[]
    ): Promise<
        {
            [key in K as K extends StringKeyOf<CustomStorage>
                ? K
                : never]: ExtractProperty<K, CustomStorage>;
        } & {
            [key in K as K extends StringKeyOf<DefiniteStorage>
                ? K
                : never]: ExtractProperty<K, DefiniteStorage>;
        } & {
            [key in K as K extends StringKeyOf<DefiniteStorage>
                ? never
                : K extends StringKeyOf<CustomStorage>
                  ? never
                  : K]: ExtractProperty<K, GenericStorage>;
        }
    > {
        let res: {
            [key in T | P | K]?: StorageItem;
        } = {};
        const getQueue: (T | P | K)[] = [];
        for (const key of keys) {
            if (this.map.has(key)) res[key] = this.map.get(key);
            else {
                getQueue.push(key);
            }
        }

        if (this.hasDatabase()) {
            res = {
                ...res,
                ...(await this.database.get(...getQueue)),
            };
        } else {
            res = {
                ...res,
                ...Object.fromEntries(
                    getQueue.map((v) => {
                        return [v, ""];
                    })
                ),
            };
        }
        return res as any;
    }
    public set<T extends StringKeyOf<DefiniteStorage>>(
        key: T,
        value: ExtractProperty<T, DefiniteStorage>
    ): this;
    public set<P extends StringKeyOf<CustomStorage>>(
        key: P,
        value: ExtractProperty<P, CustomStorage>
    ): this;
    public set<K extends StringKeyOf<GenericStorage>>(
        key: K,
        value: StorageItem | undefined
    ): this;
    public set(key: string, value: any) {
        if (value === undefined || value === null) return this.delete(key);
        this.map.set(key, value);
        if (this.hasDatabase()) this.database.addToSetQueue(key, value);
        return this;
    }

    public delete<T extends StringKeyOf<DefiniteStorage>>(key: T): this;
    public delete<P extends StringKeyOf<CustomStorage>>(key: P): this;
    public delete<K extends StringKeyOf<GenericStorage>>(key: K): this;
    public delete(key: string) {
        this.map.delete(key);
        if (this.hasDatabase()) this.database.addToDeleteQueue(key);
        return this;
    }

    public static isConnectionMode(
        payload?: string
    ): payload is "webhook" | "hexona" | "kookts" | "botroot" {
        return (
            payload == "webhook" ||
            payload == "hexona" ||
            payload == "kookts" ||
            payload == "botroot"
        );
    }
}
