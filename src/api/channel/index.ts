import User from "../user";
import { FullChannel } from "../../type";
import Rest from "../../requestor";
import { RawListResponse } from "./type";
import { RestError } from "../../error";

export default class Channel {
    rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
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
    async *list(page: number = 1, pageSize: number = 50, guildId: string, type: 'text' | 'voice') {
        const data: RawListResponse = await this.rest.get('/channel/list', {
            page,
            page_size: pageSize,
            guild_id: guildId,
            type: this.__channel_type_map[type]
        }); // revert mark
        yield data;
        for (let currentPage = page; currentPage <= data.meta.page_total; ++currentPage) {
            yield this.rest.get('/channel/list', {
                page,
                page_size: pageSize,
                guild_id: guildId,
                type: this.__channel_type_map[type]
            }); // revert mark
        }
    }

    async view(targetId: string): Promise<FullChannel> {
        return this.rest.get('/channel/view', { target_id: targetId }); // revert mark
    }

    async __create({ guildId, name, parentCategoryId, channelDetail, isCategory }: {
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
    }): Promise<FullChannel> {
        return this.rest.post('/channel/create', {
            guildId,
            name,
            parent_id: parentCategoryId,
            type: channelDetail ? this.__channel_type_map[channelDetail.type] : undefined,
            limit_amount: channelDetail?.type == 'voice' ? channelDetail.memberLimit : undefined,
            voice_quality: channelDetail?.type == 'voice' ? this.__voice_quality_map[channelDetail.voiceQuality] : undefined,
            is_category: isCategory
        }); // revert mark
    }

    async createTextChannel(guildId: string, name: string, parentCategoryId?: string) {
        return this.__create({
            guildId, name, parentCategoryId
        }); // revert mark
    }
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
        }); // revert mark
    }
    async createCategory(guildId: string, name: string) {
        return this.__create({ guildId, name, isCategory: true }); // revert mark
    }

    async update(
        channelId: string,
        name?: string,
        topic?: string,
        slowMode?: 0 | 5000 | 10000 | 15000 | 30000 | 60000 | 120000 | 300000 | 600000 | 900000 | 1800000 | 3600000 | 7200000 | 21600000
    ): Promise<FullChannel> {
        return this.rest.post('/channel/update', {
            channel_id: channelId,
            name,
            topic,
            slow_mode: slowMode
        }); // revert mark
    }

    async delete(channelId: string): Promise<void> {
        return this.rest.post('/channel/delete', { channel_id: channelId }); // revert mark
    }

    async voiceChannelUserList(channelId: string): Promise<User[]> {
        return this.rest.get('/channel/user-list', { channel_id: channelId }); // revert mark
    }
    async voiceChannelMoveUser(channelId: string, userIds: string[]): Promise<void> {
        return this.rest.post('/channel/move-user', {
            target_id: channelId,
            user_ids: userIds
        }); // revert mark
    }
}