export type SchemaEvent = {
    id: string; // sequence
} & SchemaEventNoId;

export type SchemaEventNoId = {
    summary: string; // text
    start: string; // datetime YYYY-MM-DD
    duration: string; // time hh:mm:ss
};
