import Kasumi from "@ksm/client";
import Button from "./button";
import Callback from "./callback";

export default class Event {

    private client: Kasumi<any>;

    callback: Callback;
    button: Button;

    constructor(client: Kasumi<any>) {
        this.client = client;
        this.callback = new Callback(this.client);
        this.button = new Button(this.client);
    }
}