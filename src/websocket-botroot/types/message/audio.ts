import { AudioAttachment } from "@ksm/websocket-botroot/types/attachment/audio";
import { UserInGuildNonStandard } from "@ksm/websocket-botroot/types/common";
import { MessageType } from "@ksm/websocket-botroot/types/MessageType";
import { MessageBase } from "./base";

export interface AudioMessage extends MessageBase {
    type: MessageType.voice;
    attachment: AudioAttachment;
    author: UserInGuildNonStandard;
}
