import Rest from "../requestor";
import Channel from "./channel";
import Gateway from "./gateway";
import Guild from "./guild";
import Message from "./message";
import User from "./user";

export default class API extends Rest {
    public channel: Channel;
    public gateway: Gateway;
    public guild: Guild;
    public message: Message;
    public user: User;
    constructor(token: string) {
        super(token);
        this.channel = new Channel(this.__requestor);
        this.gateway = new Gateway(this.__requestor);
        this.guild = new Guild(this.__requestor);
        this.message = new Message(this.__requestor);
        this.user = new User(this.__requestor);
    }
    public get(endpoint: string, params?: any): Promise<any> {
        return super.get(endpoint, params);
    }
    public post(endpoint: string, params?: any): Promise<any> {
        return super.post(endpoint, params);
    }
    public put(endpoint: string, params?: any): Promise<any> {
        return super.put(endpoint, params);
    }
}