import { CardBuilder } from "./builder";
import { Card as CardType, Modules, Parts, Size, Theme } from "./type";

export class Card {
    public static readonly Theme = Theme;
    public static readonly Size = Size;
    public static readonly Parts = Parts;
    public static readonly Modules = Modules;

    private __theme = Theme.INFO;
    private __size = Size.LARGE;
    private __modules: Modules[] = [];

    static builder() {
        return new CardBuilder();
    }

    public get theme() {
        return this.__theme;
    }
    public get size() {
        return this.__size;
    }
    public get modules() {
        return this.__modules;
    }
    public set modules(modules: Modules[]) {
        this.modules = modules;
    }
    constructor(card?: Partial<CardType>) {
        if (card?.theme) {
            this.setTheme(card.theme);
        }
        if (card?.size) {
            this.setSize(card.size);
        }
        if (card?.modules) {
            for (const module of card.modules) {
                this.addModule(module);
            }
        }
    }
    setTheme(theme: Theme) {
        this.__theme = theme;
        return this;
    }
    setSize(size: Size) {
        this.__size = size;
        return this;
    }
    addModule(module: Modules) {
        this.__modules.push(module);
        return this;
    }
    addText(content: string) {
        return this.addModule({
            type: Modules.Types.TEXT,
            text: {
                type: Parts.TextType.KMARKDOWN,
                content,
            },
        });
    }
    addTextWithImage(
        content: string,
        {
            position = Modules.AccessoryModes.LEFT,
            url,
            size = Size.LARGE,
            circle = false,
        }: {
            position?: Modules.AccessoryModes;
            url: string;
            size?: Size;
            circle?: boolean;
        }
    ) {
        return this.addModule({
            type: Modules.Types.TEXT,
            text: {
                type: Parts.TextType.KMARKDOWN,
                content,
            },
            mode: position,
            accessory: {
                type: Parts.AccessoryType.IMAGE,
                src: url,
                size: size,
                circle: circle,
            },
        });
    }
    addTextWithButton(
        content: string,
        {
            theme = Theme.PRIMARY,
            buttonContent,
            value,
            click,
        }: {
            buttonContent: string;
            theme?: Theme;
            value?: string;
            click?: Parts.ButtonClickType;
        }
    ) {
        return this.addModule({
            type: Modules.Types.TEXT,
            text: {
                type: Parts.TextType.KMARKDOWN,
                content,
            },
            mode: Modules.AccessoryModes.RIGHT,
            accessory: {
                type: Parts.AccessoryType.BUTTON,
                text: {
                    type: Parts.TextType.KMARKDOWN,
                    content: buttonContent,
                },
                theme,
                value,
                click,
            },
        });
    }
    addTitle(content: string) {
        return this.addModule({
            type: Modules.Types.TITLE,
            text: {
                type: Parts.TextType.PLAIN_TEXT,
                content,
            },
        });
    }
    addDivider() {
        return this.addModule({
            type: Modules.Types.DIVIDER,
        });
    }
    addImage(...links: string[]) {
        return this.addModule({
            type: Modules.Types.IMAGE,
            elements: links.map((v) => {
                return { type: Parts.AccessoryType.IMAGE, src: v };
            }),
        });
    }
    addImageGroup(...links: string[]) {
        return this.addModule({
            type: Modules.Types.MULTIPLE_IMAGE,
            elements: links.map((v) => {
                return { type: Parts.AccessoryType.IMAGE, src: v };
            }),
        });
    }
    addContext(...content: string[]) {
        return this.addModule({
            type: Modules.Types.CONTEXT,
            elements: content.map((v) => {
                if (v.startsWith("https://"))
                    return {
                        type: Parts.AccessoryType.IMAGE,
                        src: v,
                    };
                else
                    return {
                        type: Parts.TextType.KMARKDOWN,
                        content: v,
                    };
            }),
        });
    }
    addCountDown(endTime: number, mode: Modules.CountdownModes) {
        return this.addModule({
            type: Modules.Types.COUNTDOWN,
            mode,
            endTime,
        });
    }
    addVerticalTable(
        ...colums:
            | [string[]]
            | [string[], string[]]
            | [string[], string[], string[]]
    ) {
        this.addModule({
            type: Modules.Types.TEXT,
            text: {
                type: Parts.TextType.MULTI_ROW,
                cols: colums.length,
                fields: colums.map((v) => {
                    return {
                        type: Parts.TextType.KMARKDOWN,
                        content: v.join("\n"),
                    };
                }),
            },
        });
        return this;
    }
    addHorizontalTable(
        ...rows: ([string] | [string, string] | [string, string, string])[]
    ) {
        let row1 = [],
            row2 = [],
            row3 = [],
            hasRow2 = false,
            hasRow3 = false;
        for (const row of rows) {
            row1.push(row[0]);
            if (row[1]) {
                hasRow2 = true;
                row2.push(row[1]);
            } else row2.push("");
            if (row[2]) {
                hasRow3 = true;
                row3.push(row[2]);
            } else row3.push("");
        }
        let module1 = {
                type: Parts.TextType.KMARKDOWN,
                content: row1.join("\n"),
            },
            module2 = {
                type: Parts.TextType.KMARKDOWN,
                content: row2.join("\n"),
            },
            module3 = {
                type: Parts.TextType.KMARKDOWN,
                content: row3.join("\n"),
            };
        this.addModule({
            type: Modules.Types.TEXT,
            text: {
                type: Parts.TextType.MULTI_ROW,
                cols: hasRow3 ? 3 : hasRow2 ? 2 : 1,
                fields: hasRow3
                    ? [module1, module2, module3]
                    : hasRow2
                      ? [module1, module2]
                      : [module1],
            },
        });
        return this;
    }
    toJSON(): CardType {
        return {
            type: "card",
            size: this.__size,
            theme: this.__theme,
            modules: this.__modules,
        };
    }
    toString(): string {
        return JSON.stringify(this.toJSON());
    }
}
