import { Collection, Db, MongoClient } from "mongodb";
import { Database } from "..";
import { StorageItem } from "../../type";
import Config from "../../";

export interface collectionItem {
    _id: string,
    content: StorageItem;
}

const clients: {
    [key: string]: MongoClient
} = {};

export class MongoDB implements Database {
    readonly SYNC_INTERVAL;

    readonly client: MongoClient;
    readonly database: Db;
    readonly collection: Collection<collectionItem>;
    readonly map: Map<string, StorageItem> = new Map();
    constructor(connectionString: string, databaseName: string, collectionName: string, syncInterval = 30 * 1000) {
        if (!clients.hasOwnProperty(connectionString)) {
            clients[connectionString] = new MongoClient(connectionString)
        }
        this.client = clients[connectionString];

        this.database = this.client.db(databaseName);
        this.collection = this.database.collection(collectionName);
        this.SYNC_INTERVAL = syncInterval;
        this.syncTask();
    }
    public async set(key: string, value: StorageItem) {
        await this.collection.findOneAndUpdate({ "_id": key }, { $set: { "content": value } }, { upsert: true });
    }
    public async get<T extends string>(...keys: T[]): Promise<{
        [key in T]: StorageItem
    }> {
        const documents = await this.collection.find({ _id: { $in: keys } }, { limit: 1 }).toArray();
        const res: {
            [key: string]: StorageItem
        } = Object.fromEntries(keys.map(v => {
            return [v, ""]
        }));
        for (const document of documents) {
            res[document._id] = document.content;
        }
        return res as any;
    }
    public addToSetQueue(key: string, value: StorageItem): void {
        this.map.set(key, value);
    }
    private syncTask() {
        const config = Object.fromEntries(this.map.entries());
        this.map.clear();
        this.sync(config).then((() => {
            setTimeout(() => {
                this.syncTask();
            }, this.SYNC_INTERVAL);
        }))
    }
    public async has(key: string) {
        const value = await this.collection.countDocuments({ _id: key }, { limit: 1 });
        return value > 0;
    }
    public async sync(config: {
        [key: string]: StorageItem
    }) {
        const operation = Object.keys(config).map(key => {
            return {
                updateOne: {
                    filter: { "_id": key },
                    update: { $set: { "content": config[key] } },
                    upsert: true
                }
            }
        });
        if (operation.length) await this.collection.bulkWrite(operation);
    }

    public static builder(config: Config) {
        if (config.hasSync('kasumi::config.mongoConnectionString') && config.hasSync('kasumi::config.mongoDatabaseName') && config.hasSync('kasumi::config.mongoCollectionName')) {
            const database = new MongoDB(config.getSync('kasumi::config.mongoConnectionString').toString(), config.getSync('kasumi::config.mongoDatabaseName').toString(), config.getSync('kasumi::config.mongoCollectionName').toString());
            config.initDatabase(database);
            return true;
        }
        return false;
    }
}