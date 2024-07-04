import { User } from "@ksm/type";

export interface RawUserViewResponse extends User {
    os: string;
    decorations_id_map: {
        join_boice: number;
        avatar_border: number;
        background: number;
    };
}

export interface RawUserMeResponse extends User {
    banner: string;
    decorations_id_map: null;
    bot_status: number;
    tag_info?: {
        color: string;
        bg_color: string;
        text: string;
    };
    mobile_verified: boolean;
    client_id: string;
    mobile_prefix: string;
    mobile: string;
    privacy_game_activity: number;
    privacy_music_activity: number;
    enable_desktop_notification: boolean;
    audio_setting: string;
    auto_exit_audio_channel: boolean;
    invited_count: number;
    need_guide: boolean;
    created_guild: boolean;
    experience_improve: boolean;
    friend_setting: {
        all: boolean;
    };
    chat_setting: string;
    accompaniment: boolean;
    mobile_not_notify: boolean;
    mobile_notify_setting: number;
    new_join: any[];
    i18n: boolean;
    has_new_policy: boolean;
}
