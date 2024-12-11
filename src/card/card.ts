import { CardBuilder } from "./builder";
import { Card as CardType, Modules, Parts, Size, Theme } from "./type";

export class Card {
    public static readonly Theme = Theme;
    public static readonly Size = Size;
    public static readonly Parts = Parts;
    public static readonly Modules = Modules;

    public static readonly DEFAULT_IMAGE_FALLBACK_URL =
        "https://img.kookapp.cn/assets/2024-12/11/xhovfoPyzN0dw0dw.png";

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
    /**
     * Set the theme of the card.
     * @param theme The theme to use.
     * @returns `this`
     */
    setTheme(theme: Theme) {
        this.__theme = theme;
        return this;
    }
    /**
     * Set the size of the card.
     * @param size The size to use.
     * @returns `this`
     */
    setSize(size: Size) {
        this.__size = size;
        return this;
    }
    /**
     * Add a module to the card.
     * @param module The module to add.
     * @returns `this`
     */
    addModule(module: Modules) {
        this.__modules.push(module);
        return this;
    }
    /**
     * Add a text section.
     * @param content The content of the section.
     * @returns `this`
     */
    addText(content: string) {
        return this.addModule({
            type: Modules.Types.TEXT,
            text: {
                type: Parts.TextType.KMARKDOWN,
                content,
            },
        });
    }
    /**
     * Add a text section with an image accessory.
     * @param content The content of the section.
     * @returns `this`
     */
    addTextWithImage(
        content: string,
        {
            position = Modules.AccessoryModes.LEFT,
            url,
            size = Size.LARGE,
            circle = false,
            fallbackUrl,
        }: {
            /**
             * The position of the image.
             * @see {@link Modules.AccessoryModes}
             */
            position?: Modules.AccessoryModes;
            /**
             * The URL of the image.
             */
            url: string;
            /**
             * The size of the image.
             * @see {@link Size}
             */
            size?: Size;
            /**
             * Whether or not the image should be a circle.
             */
            circle?: boolean;
            /**
             * A fallback image to replace `src` when it fails to load. Only works with resources already on KOOK, i.e. url on the `kookapp.cn` domain.
             * @see {@link Parts.Image.fallbackUrl}
             */
            fallbackUrl?: string;
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
                fallbackUrl: fallbackUrl || Card.DEFAULT_IMAGE_FALLBACK_URL,
                size: size,
                circle: circle,
            },
        });
    }
    /**
     *
     * @param content The content of the section.
     * @returns `this`
     */
    addTextWithButton(
        content: string,
        {
            theme = Theme.PRIMARY,
            buttonContent,
            value,
            click,
        }: {
            /**
             * The text on the button.
             */
            buttonContent: string;
            /**
             * The theme of the button.
             * @see {@link Theme}
             */
            theme?: Theme;
            /**
             * The click value of the button.
             */
            value?: string;
            /**
             * The click type of the button.
             * @see {@link Parts.ButtonClickType}
             */
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
    /**
     * Add a title section to the card.
     * @param content The content of the section.
     * @returns `this`
     */
    addTitle(content: string) {
        return this.addModule({
            type: Modules.Types.TITLE,
            text: {
                type: Parts.TextType.PLAIN_TEXT,
                content,
            },
        });
    }
    /**
     * Add a divider section to the card.
     * @returns `this`
     */
    addDivider() {
        return this.addModule({
            type: Modules.Types.DIVIDER,
        });
    }
    /**
     * Add images to the card.
     * @param links The links to the images.
     * @returns `this`
     */
    addImage(...links: string[]) {
        return this.addModule({
            type: Modules.Types.IMAGE,
            elements: links.map((v) => {
                return {
                    type: Parts.AccessoryType.IMAGE,
                    src: v,
                    fallbackUrl: Card.DEFAULT_IMAGE_FALLBACK_URL,
                };
            }),
        });
    }
    /**
     * Add a image group to the card.
     * @param links The links to the images.
     * @returns `this`
     */
    addImageGroup(...links: string[]) {
        return this.addModule({
            type: Modules.Types.MULTIPLE_IMAGE,
            elements: links.map((v) => {
                return { type: Parts.AccessoryType.IMAGE, src: v };
            }),
        });
    }
    /**
     * Add a context section to the group.
     * @param content The contents of the section. If the content starts with `https://`, it will be treated as an image.
     * @returns `this`
     */
    addContext(...content: string[]) {
        return this.addModule({
            type: Modules.Types.CONTEXT,
            elements: content.map((v) => {
                if (v.startsWith("https://"))
                    return {
                        type: Parts.AccessoryType.IMAGE,
                        src: v,
                        fallbackUrl: Card.DEFAULT_IMAGE_FALLBACK_URL,
                    };
                else
                    return {
                        type: Parts.TextType.KMARKDOWN,
                        content: v,
                    };
            }),
        });
    }
    /**
     * Add a countdown timer to the card.
     * @param endTime The unix timestamp the timer reaches zero.
     * @param mode Type of countdown timer.
     * @see {@link Modules.CountdownModes}
     * @returns `this`
     */
    addCountDown(endTime: number, mode: Modules.CountdownModes) {
        return this.addModule({
            type: Modules.Types.COUNTDOWN,
            mode,
            endTime,
        });
    }
    /**
     * Add a vertical table to the card.
     * @param colums Each argument describes a colum (max 3). Each object in a array describe a row on that colum.
     * @returns `this`
     */
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
    /**
     * Add a horizonto table to the card.
     * @param colums Each argument describes a row. Each object in a array describe a colum (max 3) on that row.
     * @returns `this`
     */
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
    /**
     * Convert the card to a JSON object.
     * @returns The JSON representation of the card.
     */
    toJSON(): CardType {
        return {
            type: "card",
            size: this.__size,
            theme: this.__theme,
            modules: this.__modules,
        };
    }
    /**
     * Convert the card to a string.
     * @returns The string representation of the card.
     */
    toString(): string {
        return JSON.stringify(this.toJSON());
    }
}
