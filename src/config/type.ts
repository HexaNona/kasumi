export type StringKeyOf<T extends object> = Extract<keyof T, string>;

export type ExtractProperty<X, Y extends {}> =
    X extends StringKeyOf<Y> ? Y[X] : never;

/**
 * Return X if X is not equal to never
 */
export type FirstIfNotNever<X, Y> = X extends never ? Y : X;

export type NotWithType<X> = { [key in keyof Partial<X>]: never };

/**
 * Make all property in the type required
 */
export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export interface DefiniteStorage {
    "kasumi::config.token": string;
    "kasumi::config.connection":
        | "webhook"
        | "kasumi"
        | "builtin"
        | "salt"
        | "hexona"
        | "kookts"
        | "botroot";
    "kasumi::config.webhookVerifyToken"?: string;
    "kasumi::config.webhookEncryptKey"?: string;
    "kasumi::config.webhookPort"?: number;
    "kasumi::config.disableSnOrderCheck"?: boolean;
    "kasumi::config.customEndpoint"?: string;
    "kasumi::config.mongoConnectionString"?: string;
    "kasumi::config.mongoDatabaseName"?: string;
    "kasumi::config.mongoCollectionName"?: string;
    "kasumi::middleware.accessControl.userGroup.enable"?: boolean;
    "kasumi::middleware.commandMenu.enable"?: boolean;
    "kasumi::config.zDummy": StorageItem | undefined; // Hack for type checking :(
}

export interface GenericStorage {
    [key: string]: StorageItem | undefined;
}

export type StorageItem =
    | boolean
    | number
    | string
    | object
    | Array<StorageItem>;
