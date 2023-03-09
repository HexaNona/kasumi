import Rest from "../../requestor";
import { RestError } from "../../error";

export default class Game {
    rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    async activity(singer: string, musicName: string, dataType: 1 | 2 = 2): Promise<void> {
        return this.rest.post('/game/activity', {
            singer,
            music_name: musicName,
            data_type: dataType
        }).catch((e) => {
            this.rest.logger.error(e);
        });
    }
}