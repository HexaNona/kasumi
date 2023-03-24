import { RequestResponse } from "../../type";
import Rest from "../../requestor";

export default class Badge {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    private readonly __style_map = {
        name: 0,
        online: 1,
        'online/total': 2
    }

    /**
     * Get a server badge
     * @param guildId Guild ID
     * @param style Style
     * @returns Buffer of the image
     */
    async guild(guildId: string, style: 'name' | 'online' | 'online/total'): Promise<RequestResponse<Buffer>> {
        let data: Buffer, err: Error;
        try {
            data = (await this.rest.axios.get('/badge/guild', {
                responseType: 'arraybuffer',
                params: {
                    guild_id: guildId,
                    style: this.__style_map[style]
                }
            })).data;
            return { data };
        } catch (e) {
            err = e as any;
            return { err };
        }
    }
}