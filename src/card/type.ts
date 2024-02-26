export enum Theme {
    PRIMARY = "primary",
    SECONDARY = "secondary",
    INFO = "info",
    WARNING = "warning",
    DANGER = "danger",
    SUCCESS = "success"
}
export enum Size {
    LARGE = "lg",
    SMALL = "sm"
}

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
    export enum Types {
        TEXT = "section",
        IMAGE = "container",
        MULTIPLE_IMAGE = "image-group",
        TITLE = "header",
        DIVIDER = "divider",
        ACTION_GROUP = "action-group",
        CONTEXT = "context",
        FILE = "file",
        AUDIO = "audio",
        VIDEO = "video",
        COUNTDOWN = "countdown"
    }
    export enum AccessoryModes {
        LEFT = "left",
        RIGHT = "right"
    }
    export enum CountdownModes {
        DAY = "day",
        HOURS = "hour",
        SECONDS = "second"
    }

    interface Base {
        type: Types
    }
    export interface Text extends Base {
        type: Types.TEXT;
        text: Parts.Text;

        mode?: AccessoryModes;
        accessory?: Parts.Button | Parts.Accessory.Image;
    }
    export interface MultiRowText extends Base {
        type: Types.TEXT;
        text: Parts.MultiRowText;
    }
    export interface TextWithAccessory extends Text {
        mode: AccessoryModes;
        accessory: Parts.Button | Parts.Accessory.Image;
    }
    export interface Image extends Base {
        type: Types.IMAGE;
        elements: Parts.Image[];
    }
    export interface MultiImage extends Base {
        type: Types.MULTIPLE_IMAGE;
        elements: Parts.Image[];
    }
    export interface Title extends Base {
        type: Types.TITLE;
        text: Parts.PlainText;
    }
    export interface Divider extends Base {
        type: Types.DIVIDER;
    }
    export interface Button extends Base {
        type: Types.ACTION_GROUP;
        elements: [
            Parts.Button,
            Parts.Button?,
            Parts.Button?,
            Parts.Button?
        ];
    }
    export interface Context extends Base {
        type: Types.CONTEXT,
        elements: Array<Parts.Text | Parts.Image>
    }
    export interface File extends Base {
        type: Types.FILE,
        title: string,
        src: string,
        size: string
    }
    export interface Audio extends Base {
        type: Types.AUDIO,
        title: string,
        src: string,
        cover: string
    }
    export interface Video extends Base {
        type: Types.VIDEO,
        title: string,
        src: string
    }
    export interface Countdown extends Base {
        type: Types.COUNTDOWN,
        mode: CountdownModes,
        endTime: number
    }
}
export namespace Parts {
    export enum TextType {
        KMARKDOWN = 'kmarkdown',
        PLAIN_TEXT = 'plain-text',
        MULTI_ROW = 'paragraph'
    }
    export enum ButtonClickType {
        REDIRECT_URL = "link",
        RETURN_VALUE = 'return-val'
    }
    export enum AccessoryType {
        IMAGE = "image",
        BUTTON = "button"
    }
    export interface Text {
        type: TextType;
        content: string;
    }
    export interface MultiRowText {
        type: TextType.MULTI_ROW;
        cols: 1 | 2 | 3;
        fields: Parts.Text[];
    }
    export interface MarkdownText extends Text {
        type: TextType.KMARKDOWN;
    }
    export interface PlainText extends Text {
        type: TextType.PLAIN_TEXT
    }
    export interface Image {
        type: AccessoryType.IMAGE;
        src: string;
        alt?: string;
    }
    export interface Button {
        type: AccessoryType.BUTTON;
        theme: Theme;
        text: Parts.Text;
        value?: string;
        click?: ButtonClickType;
    }
    export namespace Accessory {
        export interface Image extends Parts.Image {
            size: Size;
            circle: boolean;
        }
    }
}