import { Guild, MultiPageResponse, NotificationSetting, Role, User } from "@ksm/type";


export interface RawGuildListResponseItem {
    id: string,
    name: string,
    topic: string,
    user_id: string,
    icon: string,
    notify_type: NotificationSetting,
    region: string,
    enable_open: string,
    open_id: string,
    default_channel_id: string,
    welcome_channel_id: string,
    boost_num: number,
    level: number
}

export interface RawGuildListResponse extends MultiPageResponse<RawGuildListResponseItem> {
    sort: {
        id: number
    }
}

export type RawGuildViewResponse = Guild;

export interface RawGuildUserListResponse extends MultiPageResponse<User> {
    user_count: number,
    online_count: number,
    offline_count: number
}