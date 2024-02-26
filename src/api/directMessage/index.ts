import Rest from "@ksm/requestor";
import { MessageType, Message as MessageInterface, RequestResponse, User } from "@ksm/type";
import { v4 as uuidv4 } from 'uuid';
import { NonceDismatchError } from "@ksm/error";
import { RawListResponse } from "./type";
import { Card } from "@ksm/card";
import UserChat from "./chat";

export default class DirectMessage {
    private rest: Rest;
    chat: UserChat
    constructor(rest: Rest) {
        this.rest = rest;
        this.chat = new UserChat(rest);
    }
    /**
     * Get message list of a private chat
     * @param channelId ID of the requesting channel
     * @param page Page number
     * @param pageSize Page size
     * @param messageId ID of the reference message
     * @param mode Request mode
     * @returns Array of message items
     */
    public async list(
        { userId, messageId, page, pageSize, chatCode, mode }: {
            userId: string,
            messageId?: string,
            page?: number,
            pageSize?: number,
            chatCode?: string,
            mode?: 'before' | 'around' | 'after'
        }
    ): Promise<RequestResponse<RawListResponse>> {
        return this.rest.get('/direct-message/list', {
            target_id: userId,
            chat_code: userId == undefined ? chatCode : undefined,
            msg_id: messageId,
            flag: mode,
            page: page,
            page_size: pageSize
        })
    }

    /**
     * View a message by ID
     * @param messageId ID of the requesting message
     * @returns The requested message item
     */
    public async view(messageId: string, chatCode: string) {
        return this.rest.get<MessageInterface>('/direct-message/view', {
            msg_id: messageId,
            chat_code: chatCode
        })
    }

    public async create(
        type: MessageType,
        userId: string,
        content: string | Card | Card[],
        quote?: string,
        chatCode?: string
    ): Promise<RequestResponse<{
        msg_id: string,
        msg_timestamp: number,
        nonce: string
    }>> {
        if (content instanceof Card) content = [content];
        if (content instanceof Array) content = JSON.stringify(content);
        const nonce = uuidv4();
        return this.rest.post('/direct-message/create', {
            type,
            target_id: userId,
            content,
            quote,
            chat_code: chatCode,
            nonce
        }).then((res) => {
            if (res.err) return res;
            else if (res.data.nonce == nonce) return res;
            else return { err: new NonceDismatchError() };
        })
    }

    public async update(
        messageId: string,
        content: string | Card | Card[],
        quote?: string
    ): Promise<RequestResponse<void>> {
        if (content instanceof Card) content = [content];
        if (content instanceof Array) content = JSON.stringify(content);
        return this.rest.post('/direct-message/update', {
            msg_id: messageId,
            content,
            quote
        })
    }

    public async delete(messageId: string): Promise<RequestResponse<void>> {
        return this.rest.post('/direct-message/delete', {
            msg_id: messageId
        })
    }

    public async reactionUserList(messageId: string, emojiId: string): Promise<RequestResponse<User[]>> {
        return this.rest.get('/direct-message/reaction-list', {
            msg_id: messageId,
            emoji: emojiId
        })
    }

    public async addReaction(messageId: string, emojiId: string): Promise<RequestResponse<void>> {
        return this.rest.post('/direct-message/add-reaction', {
            msg_id: messageId,
            emoji: emojiId
        })
    }

    public async deleteReaction(messageId: string, emojiId: string, userId?: string): Promise<RequestResponse<void>> {
        return this.rest.post('/direct-message/delete-reaction', {
            msg_id: messageId,
            emoji: emojiId,
            user_id: userId
        })
    }
}