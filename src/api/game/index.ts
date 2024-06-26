import { MultiPageResponse, RequestResponse, Game as GameType } from "@ksm/type";
import Rest from "@ksm/requestor";

export default class Game {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    /**
     * Get game list
     * @param type Type of games
     * @param page Page number
     * @param pageSize Page size
     */
    list(type?: 'user' | 'system' | 'all', page?: number, pageSize?: number) {
        return this.rest.multiPageRequest<MultiPageResponse<GameType>>('/game', page, pageSize, {
            type: type == 'user' ? 1 : (type == 'system' ? 2 : 0),
        })
    }

    /**
     * Create a game entry
     * @param name Name of the game
     * @param icon Icon URL of the game
     * @returns Game detail
     */
    async create(name: string, icon: string): Promise<RequestResponse<GameType>> {
        return this.rest.post('/game/create', { name, icon });
    }

    /**
     * Update a game entry
     * @param id ID of the game
     * @param name New name of the game
     * @param icon New icon of the game
     * @returns Updated game detail
     */
    async update(id: number, name?: string, icon?: string): Promise<RequestResponse<GameType>> {
        return this.rest.post('/game/update', { id, name, icon });
    }

    /**
     * Delete a game entry
     * @param id ID of the game
     */
    async delete(id: number): Promise<RequestResponse<void>> {
        return this.rest.post('/game/delete', { id });
    }

    /**
     * Start a game activity
     * @param id ID of the game
     */
    async startGameActivity(id: number): Promise<RequestResponse<void>> {
        return this.rest.post('/game/activity', { id, data_type: 1 });
    }

    /**
     * Stop a game activity
     */
    async stopGameActivity(): Promise<RequestResponse<void>> {
        return this.rest.post('/game/delete-activity', { data_type: 1 });
    }

    /**
     * Start a music activity
     * @param singer Artist(s) of the music
     * @param title Title of the music
     */
    async startMusicActivity(artist: string, title: string): Promise<RequestResponse<void>> {
        return this.rest.post('/game/activity', {
            singer: artist,
            music_name: title,
            data_type: 2
        });
    }

    /**
     * Stop a music activity
     */
    async stopMusicActivity(): Promise<RequestResponse<void>> {
        return this.rest.post('/game/delete-activity', { data_type: 2 });
    }

    /**
     * Start a music activity
     * @param singer 
     * @param musicName 
     * @param dataType
     * @deprecated
     */
    async activity(singer: string, musicName: string, dataType: 1 | 2 = 2): Promise<RequestResponse<void>> {
        return this.rest.post('/game/activity', {
            singer,
            music_name: musicName,
            data_type: dataType
        })
    }
}