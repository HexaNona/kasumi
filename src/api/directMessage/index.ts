import Rest from "../../requestor";
import { MessageType, User } from "../../type";
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
    ): Promise<RawListResponse> {
        return this.rest.get('/direct-message/list', {
            target_id: channelId,
            msg_id: messageId,
            flag: mode,
            page: page,
            page_size: pageSize
        }).catch((e) => {
            this.rest.logger.error(e);
        });
    }

    public async create(
        type: MessageType,
        userId: string,
        content: string | Card | Card[],
        quote?: string,
        chatCode?: string
    ): Promise<{
        msg_id: string,
        msg_timestamp: number,
        nonce: string
    } | undefined> {
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
        }).then((data) => {
            if (data)
                if (data.nonce == nonce) return data;
                else {
                    this.rest.logger.error(new NonceDismatchError());
                    return undefined;
                }
        }).catch((e) => {
            this.rest.logger.error(e);
            return undefined;
        });
    }

    public async update(
        messageId: string,
        content: string | Card | Card[],
        quote?: string
    ): Promise<void> {
        if (content instanceof Card) {
            content = JSON.stringify([content.toObject()]);
        } else if (content instanceof Array<Card>) {
            content = JSON.stringify(content.map(v => v.toObject()));
        }
        return this.rest.post('/direct-message/update', {
            msg_id: messageId,
            content,
            quote
        }).catch((e) => {
            this.rest.logger.error(e);
        });
    }

    public async delete(messageId: string): Promise<void> {
        return this.rest.post('/direct-message/delete', {
            msg_id: messageId
        }).catch((e) => {
            this.rest.logger.error(e);
        });
    }

    public async reactionUserList(messageId: string, emojiId: string): Promise<User[] | undefined> {
        return this.rest.get('/direct-message/reaction-list', {
            msg_id: messageId,
            emoji: emojiId
        }).catch((e) => {
            this.rest.logger.error(e);
            return undefined;
        });
    }

    public async addReaction(messageId: string, emojiId: string): Promise<void> {
        return this.rest.get('/direct-message/add-reaction', {
            msg_id: messageId,
            emoji: emojiId
        }).catch((e) => {
            this.rest.logger.error(e);
        });
    }

    public async deleteReaction(messageId: string, emojiId: string, userId?: string): Promise<void> {
        return this.rest.get('/direct-message/delete-reaction', {
            msg_id: messageId,
            emoji: emojiId,
            user_id: userId
        }).catch((e) => {
            this.rest.logger.error(e);
        });
    }
}