import { MultiPageResponse, User } from "@ksm/type";

export interface RawGuildBoostHIstoryResponseItem {
    user_id: string;
    guild_id: string;
    start_time: number;
    end_time: number;
    user: User;
}

export type RawGuildBoostHistoryResponse =
    MultiPageResponse<RawGuildBoostHIstoryResponseItem>;
