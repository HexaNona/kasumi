import { VideoAttachment } from "@ksm/websocket-botroot/types/attachment/video";
import { UserInGuildNonStandard } from "@ksm/websocket-botroot/types/common";
import { MessageType } from "@ksm/websocket-botroot/types/MessageType";
import { MessageBase } from "./base";

export interface VideoMessage extends MessageBase {
    type: MessageType.video;
    attachment: VideoAttachment;
    author: UserInGuildNonStandard;
}
