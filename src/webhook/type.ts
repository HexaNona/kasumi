import Config from "../config";
import { GuildType, NormalMessageType, WebSocket } from "../type";

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

export interface WebHookStorage {
    'kasumi::config.token': string;
    'kasumi::config.webhookVerifyToken': string;
    'kasumi::config.webhookEncryptKey': string;
    'kasumi::config.webhookPort': number;
}

// export type WebHookSafeConfig = Config

// export type WebHookSafeConfig = {
//     getSync(key: 'kasumi::config.token'): string,
//     getSync(key: 'kasumi::config.webhookVerifyToken'): string,
//     getSync(key: 'kasumi::config.webhookEncryptKey'): string,
//     getSync(key: 'kasumi::config.webhookPort'): number,
// } & Config;