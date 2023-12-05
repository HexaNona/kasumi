import BaseSession from "@ksm/plugin/session";
import BaseCommand from "@ksm/plugin/menu/baseCommand";

export type KasumiMiddleware = (session: BaseSession, command: BaseCommand) => Promise<boolean>;