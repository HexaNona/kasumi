import Rest from "../../requestor";
import { MessageType, RequestResponse, User } from "../../type";
import { v4 as uuidv4 } from 'uuid';
import { NonceDismatchError } from "../../error";
import { RawListResponse } from "./type";
import Card from "../../card";

export default class DirectMessage {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
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
        channelId: string,
        page?: number,
        pageSize?: number,
        messageId?: string,
        mode?: 'before' | 'around' | 'after'
    ): Promise<RequestResponse<RawListResponse>> {
        return this.rest.get('/direct-message/list', {
            target_id: channelId,
            msg_id: messageId,
            flag: mode,
            page: page,
            page_size: pageSize
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
        if (content instanceof Card) {
            content = JSON.stringify([content.toObject()]);
        } else if (content instanceof Array<Card>) {
            content = JSON.stringify(content.map(v => v.toObject()));
        }
        const nonce = uuidv4();
        return this.rest.post('/direct-message/create', {
            type,
            target_id: userId,
            content,
            quote,
            chat_code: chatCode,
            nonce
        }).then(({ err, data }) => {
            if (err) return { err };
            if (data.nonce == nonce) return { data };
            else return { err: new NonceDismatchError() }
        });
    }

    public async update(
        messageId: string,
        content: string | Card | Card[],
        quote?: string
    ): Promise<RequestResponse<void>> {
        if (content instanceof Card) {
            content = JSON.stringify([content.toObject()]);
        } else if (content instanceof Array<Card>) {
            content = JSON.stringify(content.map(v => v.toObject()));
        }
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