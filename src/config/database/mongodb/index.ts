import { Collection, Db, MongoClient } from "mongodb";
import { Database } from "..";
import { StorageItem } from "../../type";
import Kasumi from "../../../client";

export interface collectionItem {
    _id: string,
    content: StorageItem;
}

const clients: {
    [key: string]: MongoClient
} = {};

export class MongoDB implements Database {
    private readonly SYNC_INTERVAL;

    private readonly client: MongoClient;
    private readonly database: Db;
    private readonly collection: Collection<collectionItem>;
    private readonly setBuffer: Map<string, StorageItem | null> = new Map();
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
        this.setBuffer.set(key, value);
    }
    public addToDeleteQueue(key: string): void {
        this.setBuffer.set(key, null);
    }
    private syncTask() {
        const config = Object.fromEntries(this.setBuffer.entries());
        this.setBuffer.clear();
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
        [key: string]: StorageItem | null
    }) {
        const operation = Object.keys(config).map(key => {
            const value = config[key];
            if (value == null) {
                return {
                    deleteOne: {
                        filter: { "_id": key }
                    }
                }
            } else {
                return {
                    updateOne: {
                        filter: { "_id": key },
                        update: { $set: { "content": value } },
                        upsert: true
                    }
                }
            }
        });
        if (operation.length) await this.collection.bulkWrite(operation);
    }

    public static builder(client: Kasumi) {
        if (client.config.hasSync('kasumi::config.mongoConnectionString') && client.config.hasSync('kasumi::config.mongoDatabaseName') && client.config.hasSync('kasumi::config.mongoCollectionName')) {
            const database = new MongoDB(client.config.getSync('kasumi::config.mongoConnectionString').toString(), client.config.getSync('kasumi::config.mongoDatabaseName').toString(), client.config.getSync('kasumi::config.mongoCollectionName').toString());
            client.config.initDatabase(database);
            return true;
        }
        return false;
    }
}