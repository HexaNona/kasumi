import Config from "config";
import { GuildType, NormalMessageType, WebSocket } from "../type";
import { StringKeyOf } from "type-fest";
import { DefiniteStorage, Storage, StorageItem } from "../config/type";

export namespace WebHook {
    type ChannelType = 'GROUP' | 'PERSON' | 'BOARDCAST' | 'WEBHOOK_CHALLENGE';

    export interface ChallengeEventData {
        channel_type: 'WEBHOOK_CHALLENGE',
        type: 255,
        challenge: string,
        verify_token: string
    }

    export interface NormalMessageEventData<T extends NormalMessageType, K extends GuildType> extends WebSocket.NormalMessageEvent<T, K> {
        verify_token: string
    }

    export interface SystemMessageEventData extends WebSocket.SystemMessageEvent {
        verify_token: string
    }

    export interface NormalMessageEvent<T extends NormalMessageType, K extends GuildType> {
        s: 0,
        sn: number,
        d: NormalMessageEventData<T, K>
    }
    export interface SystemMessageEvent {
        s: 0,
        sn: number,
        d: SystemMessageEventData
    }
    export interface ChallengeEvent {
        s: 0,
        d: ChallengeEventData
    }

    export type Events = NormalMessageEvent<NormalMessageType, GuildType> | SystemMessageEvent | ChallengeEvent;
}

type WebhookKeys = 'kasumi::config.token' | 'kasumi::config.webhookPort' | 'kasumi::config.webhookVerifyToken' | 'kasumi::config.webhookEncryptKey' | 'kasumi::config.connection'

export declare class WebHookSafeConfig extends Config {
    // @ts-ignore
    get<T extends WebhookKeys, K extends StringKeyOf<Storage>>(
        ...keys: (T | K)[]
    ): Promise<
        {
            [key in (T | K)]: Storage[T | K]
        }
    >
}