import { Guild, MultiPageResponse, NotificationSetting, Role, User } from "../../type";


export interface RawListResponseItem {
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

export interface RawListResponse extends MultiPageResponse {
    items: RawListResponseItem[],
    sort: {
        id: number
    }
}

export interface RawViewResponse extends Guild { }

export interface RawUserListResponse extends MultiPageResponse {
    user_count: number,
    online_count: number,
    offline_count: number,
    items: User[]
}