import Rest from "../../requestor";
import { MessageType } from "../../type";
import { v4 as uuidv4 } from 'uuid';
import { NonceDismatchError } from "../../error";
import { RawMessageListResponse, RawMessageReactionUserList, RawMessageViewResponse } from "./type";
import Card from "../../card";

export default class Message {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }
    /**
     * Get message list of a channel
     * @param channelId ID of the requesting channel
     * @param pageSize Page size
     * @param pinned Whether or not to request pinned messages
     * @param messageId ID of the reference message
     * @param mode Request mode
     * @returns Array of message items
     */
    public async list(
        channelId: string,
        pageSize?: number,
        pinned?: 0 | 1,
        messageId?: string,
        mode?: 'before' | 'around' | 'after'
    ): Promise<RawMessageListResponse> {
        return this.rest.get('/message/list', {
            target_id: channelId,
            msg_id: messageId,
            pin: pinned,
            flag: mode,
            page_size: pageSize
        }).catch((e) => {
            this.rest.logger.error(e);
        });
    }

    /**
     * View a message by ID
     * @param messageId ID of the requesting message
     * @returns The requested message item
     */
    public async view(messageId: string): Promise<RawMessageViewResponse | undefined> {
        return this.rest.get('/message/view', {
            msg_id: messageId
        }).catch((e) => {
            this.rest.logger.error(e);
            return undefined;
        });
    }

    public async create(
        type: MessageType,
        channelId: string,
        content: string | Card | Card[],
        quote?: string,
        tempMessageTargetUser?: string
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
        return this.rest.post('/message/create', {
            type,
            target_id: channelId,
            content,
            quote,
            temp_target_id: tempMessageTargetUser,
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
        quote?: string,
        tempUpdateTargetUser?: string
    ): Promise<void> {
        if (content instanceof Card) {
            content = JSON.stringify([content.toObject()]);
        } else if (content instanceof Array<Card>) {
            content = JSON.stringify(content.map(v => v.toObject()));
        }
        return this.rest.post('/message/update', {
            msg_id: messageId,
            content,
            quote,
            temp_target_id: tempUpdateTargetUser
        }).catch((e) => {
            this.rest.logger.error(e);
        });
    }

    public async delete(messageId: string): Promise<void> {
        return this.rest.post('/message/delete', {
            msg_id: messageId
        }).catch((e) => {
            this.rest.logger.error(e);
        });
    }

    public async reactionUserList(messageId: string, emojiId: string): Promise<RawMessageReactionUserList | undefined> {
        return this.rest.get('/message/reaction-list', {
            msg_id: messageId,
            emoji: emojiId
        }).catch((e) => {
            this.rest.logger.error(e);
            return undefined;
        });
    }

    public async addReaction(messageId: string, emojiId: string): Promise<void> {
        return this.rest.post('/message/add-reaction', {
            msg_id: messageId,
            emoji: emojiId
        }).catch((e) => {
            this.rest.logger.error(e);
        });
    }

    public async deleteReaction(messageId: string, emojiId: string, userId?: string): Promise<void> {
        return this.rest.post('/message/delete-reaction', {
            msg_id: messageId,
            emoji: emojiId,
            user_id: userId
        }).catch((e) => {
            this.rest.logger.error(e);
        });
    }
}