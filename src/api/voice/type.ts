export interface IAudioJoinResponse {
    ip: string;
    port: string;
    rtcp_port: string;
    rtcp_mux: boolean;
    bitrate: number;
    audio_ssrc: string;
    audio_pt: string;
}

export interface IAudioListResponseItem {
    id: string;
    guild_id: string;
    parent_id: string;
    name: string;
}

export interface IAudioLeaveResponse {}

export interface IAudioKeepAliveResponse {}
