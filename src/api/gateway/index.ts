import Rest from "../../requestor";
import { RawGatewayResponse } from "./type";
import { RequestResponse } from '../../type';

export default class Gateway {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }
    /**
     * Get the WebSocket gateway URL
     * @param compress Whether or not to recieve compressed data,
     * where `1` stands for yes and `0` stands for no.
     * Default value is `1`
     */
    public async index(compress: 0 | 1 = 0): Promise<RequestResponse<RawGatewayResponse>> {
        return this.rest.get('/gateway/index', { compress });
    }
}