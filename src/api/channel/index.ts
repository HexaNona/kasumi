import { FullChannel, RequestResponse, User } from "@ksm/type";
import Rest from "@ksm/requestor";
import { RawChannelListResponse } from "./type";
import ChannelUser from "./user";
import ChannelRole from "./role";

export default class Channel {
    private rest: Rest;
    user: ChannelUser;
    permission: ChannelRole;
    constructor(rest: Rest) {
        this.rest = rest;
        this.user = new ChannelUser(rest);
        this.permission = new ChannelRole(rest);
    }
    private __channel_type_map = {
        text: 1,
        voice: 2
    }
    private __voice_quality_map = {
        LQ: 1,
        NM: 2,
        HQ: 3
    }

    /**
     * Get the channel list of a guild
     * @param guildId Guild ID
     * @param type Channel type
     * @param page Page number
     * @param pageSize Page size
     */
    list(guildId: string, type: 'text' | 'voice', page?: number, pageSize?: number) {
        return this.rest.multiPageRequest<RawChannelListResponse>('/channel/list', page, pageSize, {
            guild_id: guildId,
            type: this.__channel_type_map[type]
        })
    }

    /**
     * Get details of a channel
     * @param channelId Channel ID
     * @returns Channel details
     */
    async view(channelId: string): Promise<RequestResponse<FullChannel>> {
        return this.rest.get('/channel/view', { target_id: channelId })
    }

    private async __create({ guildId, name, parentCategoryId, channelDetail, isCategory }: {
        guildId: string,
        name: string,
        parentCategoryId?: string,
        channelDetail?: {
            type: 'text'
        } | {
            type: 'voice',
            memberLimit: number,
            voiceQuality: 'LQ' | 'NM' | 'HQ'
        },
        isCategory?: boolean
    }): Promise<RequestResponse<FullChannel>> {
        return this.rest.post('/channel/create', {
            guildId,
            name,
            parent_id: parentCategoryId,
            type: channelDetail ? this.__channel_type_map[channelDetail.type] : undefined,
            limit_amount: channelDetail?.type == 'voice' ? channelDetail.memberLimit : undefined,
            voice_quality: channelDetail?.type == 'voice' ? this.__voice_quality_map[channelDetail.voiceQuality] : undefined,
            is_category: isCategory
        })
    }

    /**
     * Create a text channel
     * @param guildId Guild ID
     * @param name Channel name
     * @param parentCategoryId Parent category ID
     * @returns Channel details
     */
    async createTextChannel(guildId: string, name: string, parentCategoryId?: string) {
        return this.__create({
            guildId, name, parentCategoryId
        });
    }

    /**
     * Create a voice channel
     * @param guildId Guild ID
     * @param name Channel name
     * @param memberLimit Limit of how many users can connect to the channel at the same time.
     * @param voiceQuality Voice channel quality
     * LQ = 18kbps NM = 48kbps HQ = 96kbps
     * @param parentCategoryId Parent category ID
     * @returns Channel details
     */
    async createVoiceChannel(
        guildId: string,
        name: string,
        memberLimit: number = 20,
        voiceQuality: 'LQ' | 'NM' | 'HQ' = 'NM',
        parentCategoryId?: string,
    ) {
        return this.__create({
            guildId, name, parentCategoryId,
            channelDetail: {
                type: 'voice',
                memberLimit,
                voiceQuality
            }
        });
    }

    /**
     * Create a category
     * @param guildId Guild ID
     * @param name Category name
     * @returns Category details
     */
    async createCategory(guildId: string, name: string) {
        return this.__create({ guildId, name, isCategory: true })
    }

    /**
     * Update channel details
     * @param channelId Channel ID
     * @param name Channel name
     * @param topic Channel description
     * @param slowMode Slow mode cooldown time
     * @returns Channel details
     */
    async update(
        channelId: string,
        name?: string,
        topic?: string,
        slowMode?: 0 | 5000 | 10000 | 15000 | 30000 | 60000 | 120000 | 300000 | 600000 | 900000 | 1800000 | 3600000 | 7200000 | 21600000
    ): Promise<RequestResponse<FullChannel>> {
        return this.rest.post('/channel/update', {
            channel_id: channelId,
            name,
            topic,
            slow_mode: slowMode
        })
    }

    /**
     * Delete a channel
     * @param channelId Channel ID
     */
    async delete(channelId: string): Promise<RequestResponse<void>> {
        return this.rest.post('/channel/delete', { channel_id: channelId })
    }

    /**
     * Get user list in a voice channel
     * @param channelId Channel ID
     * @returns Array of user in the channel
     */
    async voiceChannelUserList(channelId: string): Promise<RequestResponse<User[]>> {
        return this.rest.get('/channel/user-list', { channel_id: channelId })
    }

    /**
     * Move user(s) to a voice channel
     * @param channelId Destination channel ID
     * @param userIds Array of IDs of users to be moved
     */
    async voiceChannelMoveUser(channelId: string, userIds: string[]): Promise<RequestResponse<void>> {
        return this.rest.post('/channel/move-user', {
            target_id: channelId,
            user_ids: userIds
        })
    }
}