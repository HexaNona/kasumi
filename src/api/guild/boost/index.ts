import Rest from "../../../requestor";
import { RawGuildBoostHistoryResponse } from "./type";

export default class GuildBoost {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    async history(guildId: string, begin?: number, end?: number, page = 1, pageSize = 50) {
        return this.rest.multiPageRequest<RawGuildBoostHistoryResponse>('/guild-boost/history', page, pageSize, {
            guild_id: guildId,
            start_time: begin,
            end_time: end
        });
    }
}