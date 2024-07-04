import { Kasumi } from "@ksm/client";
import { StorageItem } from "@ksm/config/type";

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
     * Add a entry to delete queue and update them to database in bulk periodically
     * @param key Key of entry
     */
    addToDeleteQueue(key: string): void;

    /**
     * Download single entry from database
     * @param key Key of entry
     */
    get<T extends string>(
        ...keys: T[]
    ): Promise<{
        [key in T]: StorageItem;
    }>;

    /**
     * Check if single entry exists in database
     * @param key Key of entry
     */
    has(key: string): Promise<boolean>;

    /**
     * Sync whole object to database
     *
     * @param config Config object
     */
    sync(config: { [key: string]: StorageItem | null }): Promise<void>;

    /**
     * Initialize database in config
     * @param config Config instance
     * @returns Whether database is initialized
     */
    static builder(client: Kasumi<any>): boolean;
}
