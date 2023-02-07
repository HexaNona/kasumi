import { AxiosInstance } from "axios";
import Rest from "../../requestor";
import { RawGatewayResponse } from "./type";

export default class Gateway extends Rest {
    constructor(requestor: AxiosInstance) {
        super(requestor);
    }
    /**
     * Get the WebSocket gateway URL
     * @param compress Whether or not to recieve compressed data,
     * where `1` stands for yes and `0` stands for `0`.
     * Default value is `1`
     */
    async index(compress: 0 | 1 = 1): Promise<RawGatewayResponse> {
        return this.get('/gateway/index', { compress })
    }
}