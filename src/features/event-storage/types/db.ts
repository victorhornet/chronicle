import { Duration } from 'date-fns';

export type EventSchema = {
    id: string; // uuidv4
} & EventSchemaNoId;

export type EventSchemaNoId = {
    summary: string; // varchar(256)
    start: Date; // datetime
    duration: Duration; // time
};
