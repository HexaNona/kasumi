import { Message, User } from "../../type"

export interface RawMessageListResponse {
    items: Array<Message>
}

export type RawMessageViewResponse = Message

export type RawMessageReactionUserList = User[]