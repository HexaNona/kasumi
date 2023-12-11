import Card from "@ksm/card";
import { BaseCommand } from "@ksm/index";
import Plugin from "@ksm/plugin";
import BaseSession from "@ksm/plugin/session";
import BaseMenu from "@ksm/plugin/menu/baseMenu";

export class CommandMenu {
    static async middleware(session: BaseSession, commands: BaseCommand[]): Promise<boolean> {
        const command = commands.at(-1);
        if ((command instanceof Plugin && (session.args[0] == `(met)${session.client.me.userId}(met)` && session.args.length == 1)) || (!(command instanceof Plugin) && command instanceof BaseMenu)) {
            const card = new Card()
                .addTitle("命令列表")
                .addDivider();
            const commandList = Object.fromEntries([...command.menus(), ...command.commands()]);
            for (const commandName in commandList) {
                const command = commandList[commandName];
                if (command && commandName == command.name) {
                    let text = `\`\`\`plain\n${session.client.plugin.primaryPrefix}${command.hierarchyName}\n\`\`\``;
                    if (command.description) text += '\n' + command.description;
                    else text += '\n' + '(font)无介绍(font)[secondary]';
                    card.addText(text);
                }
            }
            await session.reply(card);
            return false;
        }
        return true;
    }
}