import BaseSession from "../session";
import BaseCommand from "../menu/baseCommand";

export type KasumiMiddleware = (session: BaseSession, command: BaseCommand) => Promise<boolean>;