import Kasumi from "../client";
import Button from "./button";
import Callback from "./callback";

export default class Event {

    private client: Kasumi;

    callback: Callback;
    button: Button;

    constructor(client: Kasumi) {
        this.client = client;
        this.callback = new Callback(this.client);
        this.button = new Button(this.client);
    }
}