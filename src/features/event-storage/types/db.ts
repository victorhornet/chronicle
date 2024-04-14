import { Duration } from 'date-fns';

export type EventSchema = {
    id: number; // sequence
} & EventSchemaNoId;

export type EventSchemaNoId = {
    summary: string; // text
    start: Date; // datetime
    duration: Duration; // time
};
