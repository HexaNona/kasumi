import { MultiPageResponse, RequestResponse } from "@ksm/type";
import Rest from "@ksm/requestor";
import {
    IAudioJoinResponse,
    IAudioKeepAliveResponse,
    IAudioLeaveResponse,
    IAudioListResponseItem,
} from "./type";

export default class Voice {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    /**
     * Join a voice channel.
     *
     * @param channelId The channel to join.
     * @param password The password to the channel, if any.
     * @param audioSSRC Defaults to 1111, see [RFC 3550](https://www.rfc-editor.org/rfc/rfc3550)
     * @param audioPT Defaults to 111, see [RFC 3551](https://www.rfc-editor.org/rfc/rfc3551)
     * @param rtcpMux Defaults to True, see [RFC 5761](https://www.rfc-editor.org/rfc/rfc5761)
     * @returns Details required to stream to the voice channel.
     */
    async join(
        channelId: string,
        {
            password,
            audioSSRC = 1111,
            audioPT = 111,
            rtcpMux = true,
        }: {
            password?: string;
            audioSSRC?: number;
            audioPT?: number;
            rtcpMux?: boolean;
        }
    ) {
        return this.rest.post<IAudioJoinResponse>("/voice/join", {
            channel_id: channelId,
            password,
            audio_ssrc: audioSSRC,
            audio_pt: audioPT,
            rtcp_mux: rtcpMux,
        });
    }

    /**
     * List all the voice channel joined.
     *
     * @returns List of joined channels.
     */
    async list() {
        return this.rest.multiPageRequest<
            MultiPageResponse<IAudioListResponseItem>
        >("/voice/list");
    }

    /**
     * Leave a voice channel.
     *
     * @param channelId The channel to leave.
     */
    async leave(channelId: string) {
        return this.rest.post<IAudioLeaveResponse>("/voice/leave", {
            channel_id: channelId,
        });
    }

    /**
     * Sends a keep alive signal to avoid being kicked out of inactivity.
     *
     * @param channelId The channel to keep alive.
     */
    async keepAlive(channelId: string) {
        return this.rest.post<IAudioKeepAliveResponse>("/voice/keep-alive", {
            channel_id: channelId,
        });
    }
}
