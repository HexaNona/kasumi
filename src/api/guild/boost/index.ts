import Rest from "@ksm/requestor";
import { RawGuildBoostHistoryResponse } from "./type";

export default class GuildBoost {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    async history(
        guildId: string,
        begin?: number,
        end?: number,
        page?: number,
        pageSize?: number
    ) {
        return this.rest.multiPageRequest<RawGuildBoostHistoryResponse>(
            "/guild-boost/history",
            page,
            pageSize,
            {
                guild_id: guildId,
                start_time: begin,
                end_time: end,
            }
        );
    }
}
