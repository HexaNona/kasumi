import Rest from "../../../requestor";
import { RawJoinedChannelResponse } from "./type";

export default class ChannelUser {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    async *joinedChannel(guildId: string, userId: string, page: number = 1, pageSize: number = 50): AsyncGenerator<RawJoinedChannelResponse, void, void> {
        const data: RawJoinedChannelResponse = await this.rest.get('/channel-user/get-joined-channel', {
            page,
            page_size: pageSize,
            guild_id: guildId,
            user_id: userId
        }).catch((e) => {
            this.rest.logger.error(e);
            return undefined;
        });
        yield data;
        for (let currentPage = page; currentPage <= data.meta.page_total; ++currentPage) {
            yield this.rest.get('/channel-user/get-joined-channel', {
                page,
                page_size: pageSize,
                guild_id: guildId,
                user_id: userId
            }).catch((e) => {
                this.rest.logger.error(e);
                return undefined;
            });
        }
    }
}