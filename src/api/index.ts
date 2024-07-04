import Logger from "bunyan";
import Rest from "@ksm/requestor";
import Asset from "./asset";
import Channel from "./channel";
import DirectMessage from "./directMessage";
import Game from "./game";
import Gateway from "./gateway";
import Guild from "./guild";
import Message from "./message";
import User from "./user";
import Badge from "./badge";
import Blacklist from "./blacklist";
import Intimacy from "./intimacy";
import Inivte from "./invite";
import Voice from "./voice";

export default class API {
    rest: Rest;

    asset: Asset;
    badge: Badge;
    blacklist: Blacklist;
    channel: Channel;
    directMessage: DirectMessage;
    game: Game;
    gateway: Gateway;
    guild: Guild;
    intimacy: Intimacy;
    invite: Inivte;
    message: Message;
    user: User;
    voice: Voice;
    constructor(token: string, logger: Logger, customEndpoint?: string) {
        this.rest = new Rest(token, logger, customEndpoint);

        this.asset = new Asset(this.rest);
        this.badge = new Badge(this.rest);
        this.blacklist = new Blacklist(this.rest);
        this.channel = new Channel(this.rest);
        this.directMessage = new DirectMessage(this.rest);
        this.game = new Game(this.rest);
        this.gateway = new Gateway(this.rest);
        this.guild = new Guild(this.rest);
        this.intimacy = new Intimacy(this.rest);
        this.invite = new Inivte(this.rest);
        this.message = new Message(this.rest);
        this.user = new User(this.rest);
        this.voice = new Voice(this.rest);
    }
}
