
export interface RawInviteListResponseItem {
    channel_id: string,
    guild_id: string,
    url_code: string,
    url: string,
    user: {
        id: string,
        username: string,
        identify_num: string,
        online: boolean,
        status: number,
        bot: boolean,
        avatar: string,
        vip_avatar: string
    }
}

export interface RawInviteCreateResponse {
    url: string
}