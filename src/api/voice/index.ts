import { MultiPageResponse, RequestResponse } from "@ksm/type";
import Rest from "@ksm/requestor";
import {
    IAudioJoinResponse,
    IAudioLeaveResponse,
    IAudioListResponseItem,
} from "./type";

export default class Voice {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    async join(
        channelId: string,
        {
            password,
            audioSSRC = 1111,
            audioPT = 111,
            rtcpMux = true,
        }: {
            password?: string;
            audioSSRC: number;
            audioPT: number;
            rtcpMux: boolean;
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

    async list() {
        return this.rest.multiPageRequest<
            MultiPageResponse<IAudioListResponseItem>
        >("/voice/list");
    }

    async leave(channelId: string) {
        return this.rest.post<IAudioLeaveResponse>("/voice/leave");
    }
}
