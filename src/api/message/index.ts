import { AxiosInstance } from "axios";
import Rest from "../../requestor";
import { MessageType, User } from "../../type";
import { v4 as uuidv4 } from 'uuid';
import { NonceDismatchError } from "../../error";
import { RawMessageItem, RawListResponse } from "./type";

export default class Message extends Rest {
    constructor(requestor: AxiosInstance) {
        super(requestor);
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
    ): Promise<RawListResponse> {
        return this.get('/message/list', {
            target_id: channelId,
            msg_id: messageId,
            pin: pinned,
            flag: mode,
            page_size: pageSize
        });
    }

    /**
     * View a message by ID
     * @param messageId ID of the requesting message
     * @returns The requested message item
     */
    public async view(messageId: string): Promise<RawMessageItem> {
        return this.get('/message/view', {
            msg_id: messageId
        });
    }

    public async create(
        type: MessageType,
        channelId: string,
        content: string,
        quote?: string,
        tempMessageTargetUser?: string
    ): Promise<{
        msg_id: string,
        msg_timestamp: number,
        nonce: string
    }> {
        const nonce = uuidv4();
        const data = await this.post('/message/create', {
            type,
            target_id: channelId,
            content,
            quote,
            temp_target_id: tempMessageTargetUser,
            nonce
        });
        if (data.nonce == nonce) return data;
        else throw new NonceDismatchError();
    }

    public async update(
        messageId: string,
        content: string,
        quote?: string,
        tempUpdateTargetUser?: string
    ): Promise<void> {
        return this.post('/message/update', {
            msg_id: messageId,
            content,
            quote,
            temp_target_id: tempUpdateTargetUser
        });
    }

    public async delete(messageId: string): Promise<void> {
        return this.post('/message/delete', {
            msg_id: messageId
        });
    }

    public async reactionUserList(messageId: string, emojiId: string): Promise<User[]> {
        return this.get('/message/reaction-list', {
            msg_id: messageId,
            emoji: emojiId
        });
    }

    public async addReaction(messageId: string, emojiId: string): Promise<void> {
        return this.get('/message/add-reaction', {
            msg_id: messageId,
            emoji: emojiId
        });
    }

    public async deleteReaction(messageId: string, emojiId: string, userId?: string): Promise<void> {
        return this.get('/message/delete-reaction', {
            msg_id: messageId,
            emoji: emojiId,
            user_id: userId
        });
    }
}