import { RequestResponse } from "../../../type";
import Rest from "../../../requestor";
import { RawListResponse } from "./type";

export default class GuildMute {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    /**
     * Get muted user ID
     * @param guildId Guild ID
     * @param returnType Format of the return data, can only be `detail`
     * @returns List of IDs of user who are muted
     */
    list(guildId: string, returnType: string = 'detail'): Promise<RequestResponse<RawListResponse>> {
        return this.rest.get('/guild-mute/list', {
            guild_id: guildId,
            return_type: returnType
        })
    }

    /**
     * Mute or deafen a user
     * @param guildId Guild ID
     * @param usetId User ID
     * @param type Type of action: mute to disallow user to speak, deaf to disallow user to listen
     */
    create(guildId: string, usetId: string, type: 'mute' | 'deaf'): Promise<RequestResponse<void>> {
        return this.rest.post('/guild-mute/create', {
            guild_id: guildId,
            uset_id: usetId,
            type: type == 'mute' ? 1 : type == 'deaf' ? 2 : undefined
        })
    }

    /**
     * Remove mute or deafen on a user
     * @param guildId Guild ID
     * @param usetId User ID
     * @param type Type of action: mute to allow user to speak, deaf to allow user to listen
     */
    delete(guildId: string, usetId: string, type: 'mute' | 'deaf'): Promise<RequestResponse<void>> {
        return this.rest.post('/guild-mute/delete', {
            guild_id: guildId,
            uset_id: usetId,
            type: type == 'mute' ? 1 : type == 'deaf' ? 2 : undefined
        })
    }
}