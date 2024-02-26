import { Card } from "./card";
import { Modules, Parts, Size, Theme } from "./type";

class CardBuilderNotCompleteError extends Error {
    constructor() {
        super("The card or module is not correctly or completely built.");
    }
}

abstract class Builder<T extends Card | Builder<any>> {
    constructor(protected parent: T) { };
    protected abstract finishCondition(): boolean;
    protected abstract build(): void;
    end() {
        if (!this.finishCondition()) throw new CardBuilderNotCompleteError();
        return this.parent;
    }
}

export class CardBuilder extends Builder<Card> {
    constructor(protected card = new Card()) {
        super(card);
    };
    theme(theme: Theme) {
        this.card.setTheme(theme);
        return this;
    }
    size(size: Size) {
        this.card.setSize(size);
        return this;
    }
    module() {
        return new ModulesBuilder(this);
    }
    protected finishCondition(): boolean { return true; }
    protected build(): void { }
    end(): Card {
        return this.card;
    }
}

export class ModulesBuilder extends Builder<CardBuilder> {
    protected modules: Modules[] = [];
    text() {
        return new TextModuleBuilder(this);
    }
    title() {
        return new TitleModuleBuilder(this);
    }
    divider() {
        return new DividerModuleBuilder(this);
    }
    image() {
        return new ImageModuleBuilder(this);
    }
    multiImage() {
        return new MutliImageModuleBuilder(this);
    }
    context() {
        return new ContextModuleBuilder(this);
    }
    countdown() {
        return new CountdownModuleBuilder(this);
    }
    protected finishCondition(): boolean {
        return true;
    }
    protected build(): void {
        for (const module of this.modules) {
            this.parent["card"].addModule(module);
        }
    }
}

abstract class ModuleBuilder<T extends Modules> extends Builder<ModulesBuilder> {
    protected module: Partial<T> = {};
    protected isModuleFilled(payload: Partial<T>): payload is T {
        return payload && this.finishCondition();
    }
    protected build(): void {
        if (this.isModuleFilled(this.module)) {
            this.parent['modules'].push(this.module);
        }
    }
}

class CountdownModuleBuilder extends ModuleBuilder<Modules.Countdown> {
    private _mode: Modules.CountdownModes = Modules.CountdownModes.DAY;
    private _time = Date.now() + 5 * 60 * 1000;
    mode(mode: Modules.CountdownModes) {
        this._mode = mode;
        return this;
    }
    time(time: number) {
        this._time = time;
        return this;
    }
    protected finishCondition(): boolean {
        return true;
    }
    protected build(): void {
        this.module = {
            type: Modules.Types.COUNTDOWN,
            mode: this._mode,
            endTime: this._time
        }
        super.build();
    }
}

class ContextModuleBuilder extends ModuleBuilder<Modules.Context> {
    text() {
        return new TextPartBuilder(this);
    }
    image(): ImagePartBuilder {
        return new ImagePartBuilder(this);
    }
    protected finishCondition(): boolean {
        return this.module.elements?.length != undefined && this.module.elements?.length > 0 && this.module.elements?.length <= 9;
    }
    protected build(): void {
        this.module.type = Modules.Types.CONTEXT
        super.build();
    }
}

class ImageModuleBuilder extends ModuleBuilder<Modules.Image> {
    image(): ImagePartBuilder {
        return new ImagePartBuilder(this);
    }
    protected finishCondition(): boolean {
        return this.module.elements?.length != undefined && this.module.elements?.length > 0 && this.module.elements?.length <= 9;
    }
    protected build(): void {
        this.module.type = Modules.Types.IMAGE;
        super.build();
    }
}

class MutliImageModuleBuilder extends ModuleBuilder<Modules.MultiImage> {
    image(): ImagePartBuilder {
        return new ImagePartBuilder(this);
    }
    protected finishCondition(): boolean {
        return this.module.elements?.length != undefined && this.module.elements?.length > 0 && this.module.elements?.length <= 9;
    }
    protected build(): void {
        this.module.type = Modules.Types.MULTIPLE_IMAGE;
        super.build();
    }
}

class DividerModuleBuilder extends ModuleBuilder<Modules.Divider> {
    protected finishCondition(): boolean {
        return true;
    }
    protected build(): void {
        this.module = {
            type: Modules.Types.DIVIDER
        };
        super.build();
    }
}

class TextModuleBuilder extends ModuleBuilder<Modules.Text> {
    text() {
        return new TextPartBuilder(this);
    }
    image() {
        return new ImageAccessoryBuilder(this);
    }
    button() {
        return new ButtonAccessoryBuilder(this);
    }
    protected finishCondition(): boolean {
        return this.module.type == Modules.Types.TEXT &&
            typeof this.module.text == 'string';
    }
    protected build(): void {
        this.module.type = Modules.Types.TEXT;
        super.build();
    }
}

class ButtonAccessoryBuilder extends Builder<TextModuleBuilder> {
    private module: Partial<Parts.Button> = {};
    private useStrictUrlMatching = false;
    private strictUrlMatchingRegex = /https?:\/\//;
    private _theme = Theme.PRIMARY;
    private _click?: Parts.ButtonClickType;
    private _value = "";
    text() {
        return new TextPartBuilder(this);
    }
    theme(theme: Theme) {
        this._theme = theme;
        return this;
    }
    click(click?: Parts.ButtonClickType) {
        this._click = click;
        return this;
    }
    value(value: string) {
        this._value = value;
        return this;
    }
    protected finishCondition(): boolean {
        return (
            !(
                this.useStrictUrlMatching &&
                this._click == Parts.ButtonClickType.REDIRECT_URL
            ) ||
            this.strictUrlMatchingRegex.test(this._value) &&
            (this.module.text != undefined && typeof this.module.text.content == 'string')
        );
    }
    private hasText(payload: any): payload is Parts.Text {
        return payload && this.finishCondition();
    }
    protected build(): void {
        this.parent["module"].mode = Modules.AccessoryModes.RIGHT;
        if (this.hasText(this.module.text)) {
            this.parent["module"].accessory = {
                type: Parts.AccessoryType.BUTTON,
                theme: this._theme,
                value: this._value,
                click: this._click,
                text: this.module.text
            }
        }
    }
}


class ImagePartBuilder extends Builder<TextModuleBuilder | ImageModuleBuilder | MutliImageModuleBuilder | ContextModuleBuilder> {
    private useStrictUrlMatching = false;
    private strictUrlMatchingRegex = /https?:\/\/img\.kookapp\.cn\/(?:assets|attachments|avatars)\/\d{4}-\d{2}\/.+\.(?:jpg|png|gif|webp)/;
    protected _mode = Modules.AccessoryModes.LEFT;
    private _url = "";
    protected _size = Size.LARGE;
    protected _isCircle = false;
    protected _alt?: string;
    url(url: string) {
        this._url = url;
        return this;
    }
    alt(alt: string) {
        this._alt = alt;
    }
    protected finishCondition(): boolean {
        return this._url != undefined &&
            (!this.useStrictUrlMatching ||
                this.strictUrlMatchingRegex.test(this._url));
    }
    protected build(): void {
        if (this.parent instanceof TextModuleBuilder) {
            this.parent["module"].mode = this._mode;
            this.parent["module"].accessory = {
                type: Parts.AccessoryType.IMAGE,
                src: this._url,
                alt: this._alt,
                size: this._size,
                circle: this._isCircle
            }
        } else {
            if (!this.parent["module"].elements) this.parent["module"].elements = [];
            this.parent["module"].elements.push({
                type: Parts.AccessoryType.IMAGE,
                src: this._url,
                alt: this._alt
            })
        }
    }
}

class ImageAccessoryBuilder extends ImagePartBuilder {
    mode(mode: Modules.AccessoryModes) {
        this._mode = mode;
        return this;
    }
    size(size: Size) {
        this._size = size;
        return this;
    }
    circle(isCircle: boolean) {
        this._isCircle = isCircle;
        return this;
    }
}

class TitleModuleBuilder extends ModuleBuilder<Modules.Title> {
    text() {
        return new PlainTextPartBuilder(this);
    }
    protected finishCondition(): boolean {
        return this.module.type == Modules.Types.TITLE &&
            typeof this.module.text == 'string';
    }
    protected build(): void {
        this.module.type = Modules.Types.TITLE;
        if (this.isModuleFilled(this.module)) {
            this.parent["modules"].push(this.module);
        }
    }
}


class PlainTextPartBuilder extends Builder<
    TextModuleBuilder |
    TitleModuleBuilder |
    ButtonAccessoryBuilder
> {
    protected _type?: Parts.TextType = Parts.TextType.PLAIN_TEXT;
    protected _content?: string;
    content(content: string) {
        this._content = content;
        return this;
    }
    protected finishCondition(): boolean {
        return (
            this._type == Parts.TextType.KMARKDOWN ||
            this._type == Parts.TextType.PLAIN_TEXT
        ) && typeof this._content == 'string'
    }
    protected build(): void {
        if (this._type && this._content) {
            this.parent
            if (this.parent instanceof TitleModuleBuilder) {
                this.parent['module'].text = {
                    type: Parts.TextType.PLAIN_TEXT,
                    content: this._content
                }
            } else if (this.parent instanceof ButtonAccessoryBuilder) {
                this.parent['module'].text = {
                    type: this._type,
                    content: this._content
                }
            } else {
                this.parent['module'].text = {
                    type: this._type,
                    content: this._content
                }
            }
        }
    }
}

class TextPartBuilder extends PlainTextPartBuilder {
    constructor(args: any) {
        super(args);
        this._type = Parts.TextType.KMARKDOWN;
    }
    format(type: Parts.TextType) {
        this._type = type;
        return this;
    }
}