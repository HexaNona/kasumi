import Logger from "bunyan";
import Rest from "../requestor";
import Asset from "./asset";
import Channel from "./channel";
import Game from "./game";
import Gateway from "./gateway";
import Guild from "./guild";
import Message from "./message";
import User from "./user";

export default class API {
    public rest: Rest;

    public asset: Asset;
    public channel: Channel;
    public game: Game;
    public gateway: Gateway;
    public guild: Guild;
    public message: Message;
    public user: User;
    constructor(token: string, logger: Logger) {
        this.rest = new Rest(token, logger);

        this.asset = new Asset(this.rest);
        this.channel = new Channel(this.rest);
        this.game = new Game(this.rest);
        this.gateway = new Gateway(this.rest);
        this.guild = new Guild(this.rest);
        this.message = new Message(this.rest);
        this.user = new User(this.rest);
    }
}