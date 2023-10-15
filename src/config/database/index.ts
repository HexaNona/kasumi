import Config from "..";
import { StorageItem } from "../type";

export declare abstract class Database {
    /**
     * Update single entry in database
     * @param key Key of entry
     * @param value Value of entry
     */
    set(key: string, value: StorageItem): Promise<void>;

    /**
     * Add a entry to set queue and update them to database in bulk periodically
     */
    addToSetQueue(key: string, value: StorageItem): void;

    /**
     * Download single entry from database
     * @param key Key of entry
     */
    get<T extends string>(...keys: T[]): Promise<{
        [key in T]: StorageItem
    }>;



    /**
     * Check if single entry exists in database
     * @param key Key of entry
     */
    has(key: string): Promise<boolean>;

    /**
     * Sync whole object to database
     * 
     * @param config Config instance
     */
    sync(config: {
        [key: string]: StorageItem
    }): Promise<void>;

    /**
     * Initialize database in config
     * @param config Config instance
     */
    static init(config: Config): void;
}