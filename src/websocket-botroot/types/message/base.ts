import { MessageType } from "@ksm/websocket-botroot/types/MessageType";

export interface MessageBase {
    type: MessageType;
    msgId: string;
    msgTimestamp: number;
    channelId: string;
    guildId?: string;
    channelType: string;
    authorId: string;
}
