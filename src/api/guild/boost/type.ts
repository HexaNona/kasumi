import { MultiPageResponse, User } from "../../../type";

export interface RawGuildBoostHIstoryResponseItem {
    user_id: string,
    guild_id: string,
    start_time: number,
    end_time: number,
    user: User
}

export type RawGuildBoostHistoryResponse = MultiPageResponse<RawGuildBoostHIstoryResponseItem>;

