import Rest from "@ksm/requestor";
import { MessageType, Message as MessageInterface, User, RequestResponse } from "@ksm/type";
import { v4 as uuidv4 } from 'uuid';
import { NonceDismatchError } from "@ksm/error";
import { RawMessageListResponse } from "./type";
import Card from "@ksm/card";

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
    ) {
        return this.rest.get<RawMessageListResponse>('/message/list', {
            target_id: channelId,
            msg_id: messageId,
            pin: pinned,
            flag: mode,
            page_size: pageSize
        })
    }

    /**
     * View a message by ID
     * @param messageId ID of the requesting message
     * @returns The requested message item
     */
    public async view(messageId: string) {
        return this.rest.get<MessageInterface>('/message/view', {
            msg_id: messageId
        })
    }

    /**
     * Send a message
     * @param type Message type
     * @param channelId Channel ID
     * @param content Messsage content
     * @param quote Quote message ID
     * @param tempMessageTargetUser ID of temp message target user
     * @returns Message ID
     */
    public async create(
        type: MessageType,
        channelId: string,
        content: string | Card | Card[],
        quote?: string,
        tempMessageTargetUser?: string
    ) {
        if (content instanceof Card) content = [content];
        if (content instanceof Array) content = JSON.stringify(content);
        const nonce = uuidv4();
        return this.rest.post<{
            msg_id: string,
            msg_timestamp: number,
            nonce: string
        }>('/message/create', {
            type,
            target_id: channelId,
            content,
            quote,
            temp_target_id: tempMessageTargetUser,
            nonce
        }).then((res) => {
            if (res.err) return res;
            else if (res.data.nonce == nonce) return res;
            else return { err: new NonceDismatchError() };
        })
    }

    /**
     * Update a message
     * @param messageId Message ID
     * @param content Message content
     * @param quote Quote message ID
     * @param tempUpdateTargetUser ID of temporary update target user
     */
    public async update(
        messageId: string,
        content: string | Card | Card[],
        quote?: string,
        tempUpdateTargetUser?: string
    ) {
        if (content instanceof Card) content = [content];
        if (content instanceof Array) content = JSON.stringify(content);
        return this.rest.post<void>('/message/update', {
            msg_id: messageId,
            content,
            quote,
            temp_target_id: tempUpdateTargetUser
        })
    }

    /**
     * Delete a message
     * @param messageId Message ID
     */
    public async delete(messageId: string): Promise<RequestResponse<void>> {
        return this.rest.post('/message/delete', {
            msg_id: messageId
        })
    }

    /**
     * Get a list of user who react to a emoji under a message
     * @param messageId Message ID
     * @param emojiId Emoji ID
     * @returns User list
     */
    public async reactionUserList(messageId: string, emojiId: string) {
        return this.rest.get<User[]>('/message/reaction-list', {
            msg_id: messageId,
            emoji: emojiId
        })
    }

    /**
     * Add reaction to a message
     * @param messageId Message ID
     * @param emojiId Emoji ID
     */
    public async addReaction(messageId: string, emojiId: string) {
        return this.rest.post<void>('/message/add-reaction', {
            msg_id: messageId,
            emoji: emojiId
        })
    }

    /**
     * Delete a reaction
     * @param messageId Message ID
     * @param emojiId Emoji ID
     * @param userId User ID, do not provide = self
     */
    public async deleteReaction(messageId: string, emojiId: string, userId?: string) {
        return this.rest.post<void>('/message/delete-reaction', {
            msg_id: messageId,
            emoji: emojiId,
            user_id: userId
        })
    }
}