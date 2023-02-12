import { GuildType, WebSocket } from "../type";

export namespace WebHook {
    type ChannelType = 'GROUP' | 'PERSON' | 'BOARDCAST' | 'WEBHOOK_CHALLENGE';

    export interface ChallengeEventData {
        channel_type: 'WEBHOOK_CHALLENGE',
        type: 255,
        challenge: string,
        verify_token: string
    }

    export interface NormalMessageEventData<T extends WebSocket.NormalMessageType, K extends GuildType> extends WebSocket.NormalMessageEvent<T, K> {
        verify_token: string
    }

    export interface SystemMessageEventData extends WebSocket.SystemMessageEvent {
        verify_token: string
    }

    export interface NormalMessageEvent<T extends WebSocket.NormalMessageType, K extends GuildType> {
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

    export type Events = NormalMessageEvent<WebSocket.NormalMessageType, GuildType> | SystemMessageEvent | ChallengeEvent;
}