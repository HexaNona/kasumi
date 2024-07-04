export interface EventBase {
    msgId: string;
    msgTimestamp: number;
    type: string;
    [ket: string]: any;
}
