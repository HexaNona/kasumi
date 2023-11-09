export type StringKeyOf<T extends object> = Extract<keyof T, string>;

export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;

/**
 * Combine T and K only T is not equal to Q
 * 
 * Otherwise K will be returned
 */
export type CombineOnlyWhenNotEqual<T, K, Q> = Equals<T, Q> extends true ? K : T | K

export interface DefiniteStorage {
    'kasumi::config.token': string,
    'kasumi::config.connection': 'webhook' | 'hexona' | 'kookts' | 'botroot',
    'kasumi::config.webhookVerifyToken'?: string,
    'kasumi::config.webhookEncryptKey'?: string,
    'kasumi::config.webhookPort'?: number,
    'kasumi::config.disableSnOrderCheck'?: boolean,
    'kasumi::config.customEndpoint'?: string,
    'kasumi::config.mongoConnectionString'?: string,
    'kasumi::config.mongoDatabaseName'?: string,
    'kasumi::config.mongoCollectionName'?: string
}
export interface Storage extends DefiniteStorage {
    [key: string]: StorageItem | undefined;
}

export type StorageItem = boolean | number | string | object | Array<StorageItem>;