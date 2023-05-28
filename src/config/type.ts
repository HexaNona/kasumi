export interface DefiniteStorage {
    token: string,
    connection: 'webhook' | 'hexona' | 'kookts' | 'botroot',
    webhookVerifyToken: string,
    webhookEncryptKey: string,
    webhookPort: number,
    disableSnOrderCheck: boolean
}
export interface Storage extends DefiniteStorage {
    [key: string]: any
}