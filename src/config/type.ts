export interface DefiniteStorage {
    'kasumi::config.token': string,
    'kasumi::config.connection': 'webhook' | 'hexona' | 'kookts' | 'botroot',
    'kasumi::config.webhookVerifyToken': string,
    'kasumi::config.webhookEncryptKey': string,
    'kasumi::config.webhookPort': number,
    'kasumi::config.disableSnOrderCheck': boolean,
}
export interface Storage extends DefiniteStorage {
    [key: string]: StorageItem;
}

export type StorageItem = boolean | number | string | object | [];