import { Card as CardType, Modules, Size, Theme } from "./type";

export default class Card {
    __theme: Theme = 'info';
    __size: Size = 'lg';
    __modules: Modules[] = [];
    constructor(card?: CardType) {
        if (card) {
            this.setTheme(card.theme).setSize(card.size);
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
            type: 'section',
            text: {
                type: 'kmarkdown',
                content
            }
        });
    }
    addTextWithImage(content: string, {
        position = 'left',
        url,
        size = 'lg',
        circle = false
    }: {
        position?: "left" | "right",
        url: string,
        size?: Size,
        circle?: boolean
    }) {
        return this.addModule({
            type: 'section',
            text: {
                type: 'kmarkdown',
                content
            },
            mode: position,
            accessory: {
                type: 'image',
                src: url,
                size: size,
                circle: circle
            }
        });
    }
    addTextWithButton(content: string, {
        theme = 'primary',
        buttonContent,
        value,
        click
    }: {
        buttonContent: string,
        theme?: Theme,
        value?: string,
        click?: "link" | "return-val";
    }) {
        return this.addModule({
            type: 'section',
            text: {
                type: 'kmarkdown',
                content
            },
            mode: 'right',
            accessory: {
                type: 'button',
                text: {
                    type: 'kmarkdown',
                    content: buttonContent
                },
                theme: theme,
                value: value,
                click: click ? click : undefined
            }
        });
    }
    addTitle(content: string) {
        return this.addModule({
            type: 'header',
            text: {
                type: 'plain-text',
                content
            }
        })
    }
    addDivider() {
        return this.addModule({
            type: 'divider'
        });
    }
    addImage(...links: string[]) {
        return this.addModule({
            type: 'container',
            elements: links.map(v => { return { type: 'image', src: v } })
        });
    }
    addImageGroup(...links: string[]) {
        return this.addModule({
            type: 'image-group',
            elements: links.map(v => { return { type: 'image', src: v } })
        });
    }
    addContext(...content: string[]) {
        return this.addModule({
            type: 'context',
            elements: content.map(v => {
                if (v.startsWith('https://')) return {
                    type: 'image',
                    src: v
                }; else return {
                    type: 'kmarkdown',
                    content: v
                }
            })
        });
    }
    addCountDown(endTime: number, mode: 'second' | 'hour' | 'day') {
        return this.addModule({
            type: 'countdown',
            mode,
            endTime
        });
    }
    toObject(): CardType {
        return {
            type: 'card',
            size: this.__size,
            theme: this.__theme,
            modules: this.__modules
        };
    }
    toString(): string {
        return JSON.stringify([this.toObject()]);
    }
}