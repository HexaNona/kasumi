import { AxiosInstance } from "axios";
import Rest from "../../requestor";
import { RawListResponse, RawUserListResponse, RawViewResponse } from "./type";

export default class Guild extends Rest {
    constructor(requestor: AxiosInstance) {
        super(requestor);
    }

    async *list(page: number = 1, pageSize: number = 50): AsyncGenerator<RawListResponse, void, void> {
        let data: RawListResponse = await this.get('/guild/list', { page, page_size: pageSize });
        yield data;
        for (let currentPage = page + 1; currentPage <= data.meta.page_total; ++currentPage) {
            yield await this.get('/guild/list', { page, page_size: pageSize });
        }
    }

    async view(guildId: string): Promise<RawViewResponse> {
        return this.get('/guild/list', { guild_id: guildId });
    }

    private readonly __desc_asc_map = {
        desc: 0,
        asc: 1
    }
    private __get_desc_asc_map(input: 'desc' | 'asc' | undefined): number | undefined {
        if (input) return this.__desc_asc_map[input];
        else return undefined;
    }
    async *userList({ guildId, channelId, search, roleId, mobileVerified, lastSeen, joinTime, page = 1, pageSize = 50, userId }: {
        guildId: string,
        channelId?: string,
        search?: string,
        roleId?: number,
        mobileVerified?: boolean,
        lastSeen?: 'desc' | 'asc',
        joinTime?: 'desc' | 'asc',
        page: number,
        pageSize: number,
        userId?: number
    }): AsyncGenerator<RawUserListResponse, void, void> {
        let data: RawUserListResponse = await this.get('/guild/list', {
            guild_id: guildId,
            channel_id: channelId,
            search,
            role_id: roleId,
            mobile_verified: mobileVerified ? (mobileVerified == true ? 1 : 0) : undefined,
            active_time: this.__get_desc_asc_map(lastSeen),
            joined_at: this.__get_desc_asc_map(joinTime),
            page,
            page_size: pageSize,
            filter_user_id: userId
        });
        yield data;
        for (let currentPage = page + 1; currentPage <= data.meta.page_total; ++currentPage) {
            yield await this.get('/guild/list', {
                guild_id: guildId,
                channel_id: channelId,
                search,
                role_id: roleId,
                mobile_verified: mobileVerified ? (mobileVerified == true ? 1 : 0) : undefined,
                active_time: this.__get_desc_asc_map(lastSeen),
                joined_at: this.__get_desc_asc_map(joinTime),
                page,
                page_size: pageSize,
                filter_user_id: userId
            });
        }
    }

    async nickname(guildId: string, nickname?: string, userId?: string): Promise<void> {
        return this.post('/guild/nickname', {
            guild_id: guildId,
            nickname,
            user_id: userId
        });
    }

    async leave(guildId: string): Promise<void> {
        return this.post('/guild/leave', {
            guild_id: guildId
        });
    }

    async kick(guildId: string, userId: string): Promise<void> {
        return this.post('/guild/kickout', {
            guild_id: guildId,
            target_id: userId
        });
    }
}