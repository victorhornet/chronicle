export type SchemaEvent = {
    id: string; // sequence
} & SchemaEventNoId;

export type SchemaEventNoId = {
    summary: string; // text
    start: string; // datetime YYYY-MM-DD HH:mm:ss
    duration: string; // time hh:mm:ss
    category: string; // primary key of category (and its title)
};
