import { Guild, MultiPageResponse, NotificationSetting, Role, User } from "../../../type";


export interface RawListResponse {
    mic: {
        type: 1,
        user_ids: string[]
    },
    headset: {
        type: 2,
        user_ids: string[]
    }
}

