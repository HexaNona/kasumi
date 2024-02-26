import { MultiPageResponse, Emoji } from "@ksm/type";
import Rest from "@ksm/requestor";
import FormData from "form-data";

export default class GuildEmoji {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    /**
     * Get a list of emojis in a guild
     * @param guildId Guild ID
     * @param page Page number
     * @param pageSize Page size
     */
    list(guildId: string, page?: number, pageSize?: number) {
        return this.rest.multiPageRequest<MultiPageResponse<Emoji>>('/guild-emoji/list', page, pageSize, {
            guild_id: guildId
        });
    }

    /**
     * Create a emoji in a guild
     * @param guildId Guild ID
     * @param name Emoji name
     * @param emoji Emoji image buffer (must be png)
     * @returns Emoji details
     */
    create(guildId: string, emoji: Buffer, name?: string, config?: FormData.AppendOptions) {
        const form = new FormData();
        form.append('emoji', emoji, {
            filename: 'image.png',
            ...config
        });
        form.append('guild_id', guildId);
        if (name) form.append('name', name);
        return this.rest.post<Emoji>('/guild-emoji/create', form, {
            headers: form.getHeaders()
        })
    }

    /**
     * Update details of a emoji
     * @param emojiId Emoji ID
     * @param name Emoji name
     */
    update(emojiId: string, name: string) {
        return this.rest.post<void>('/guild-emoji/update', {
            id: emojiId,
            name
        })
    }

    /**
     * Delete a emoji   
     * @param emojiId Emoji ID
     */
    delete(emojiId: string) {
        return this.rest.post<void>('/guild-emoji/delete', {
            emoji_id: emojiId
        })
    }
}