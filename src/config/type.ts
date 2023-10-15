export interface DefiniteStorage {
    'kasumi::token': string,
    'kasumi::connection': 'webhook' | 'hexona' | 'kookts' | 'botroot',
    'kasumi::webhookVerifyToken': string,
    'kasumi::webhookEncryptKey': string,
    'kasumi::webhookPort': number,
    'kasumi::disableSnOrderCheck': boolean,
}
export interface Storage extends DefiniteStorage {
    [key: string]: StorageItem;
}

export type StorageItem = boolean | number | string | object | [];