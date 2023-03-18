export type Theme = "primary" | "secondary" | "info" | "warning" | "danger" | "success";
export type Size = 'lg' | 'sm';

export interface Card {
    type: "card",
    theme: Theme,
    size: Size,
    modules: Array<Modules>
}
export type CardMessage = Array<Card>

export type Modules =
    Modules.Text |
    Modules.MultiRowText |
    Modules.TextWithAccessory |
    Modules.Image |
    Modules.MultiImage |
    Modules.Title |
    Modules.Divider |
    Modules.Button |
    Modules.Context |
    Modules.File |
    Modules.Audio |
    Modules.Video |
    Modules.Countdown;

export namespace Modules {
    export interface Text {
        type: "section";
        text: Parts.Text;
    }
    export interface MultiRowText {
        type: "section";
        text: {
            type: "paragraph";
            cols: 1 | 2 | 3;
            fields: Parts.Text[];
        }
    }
    export interface TextWithAccessory extends Text {
        mode: "left" | "right";
        accessory: Parts.Button | Parts.Accessory.Image;
    }
    export interface Image {
        type: "container";
        elements: Parts.Image[];
    }
    export interface MultiImage {
        type: "image-group";
        elements: Parts.Image[];
    }
    export interface Title {
        type: "header";
        text: Parts.PlainText;
    }
    export interface Divider {
        type: "divider";
    }
    export interface Button {
        type: "action-group";
        elements: [
            Parts.Button,
            Parts.Button?,
            Parts.Button?,
            Parts.Button?
        ];
    }
    export interface Context {
        type: "context",
        elements: Array<Parts.Text | Parts.Image>
    }
    export interface File {
        type: "file",
        title: string,
        src: string,
        size: string
    }
    export interface Audio {
        type: "audio",
        title: string,
        src: string,
        cover: string
    }
    export interface Video {
        type: "video",
        title: string,
        src: string
    }
    export interface Countdown {
        type: "countdown",
        mode: "second" | "hour" | "day",
        endTime: number
    }
}
export namespace Parts {
    export interface Text {
        type: 'kmarkdown' | 'plain-text';
        content: string;
    }
    export interface MarkdownText extends Text {
        type: 'kmarkdown';
    }
    export interface PlainText extends Text {
        type: 'plain-text';
    }
    export interface Image {
        type: 'image';
        src: string;
        alt?: string;
    }
    export interface Button {
        type: "button";
        theme: Theme;
        value?: string;
        click?: "" | "link" | "return-val";
        text: Parts.Text;
    }
    export namespace Accessory {
        export interface Image extends Parts.Image {
            size: Size;
            circle: boolean;
        }
    }
}