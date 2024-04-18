import { Event as TimeBlockEvent } from '@/utils';
import Database from '@tauri-apps/plugin-sql';
import * as db from './db';
import { event_from_schema, event_to_schema } from './schema';

export async function load_events(conn: Database): Promise<TimeBlockEvent[]> {
    return (await db.read_all_events(conn)).map(event_from_schema);
}
export async function load_events_range(
    conn: Database,
    after: Date,
    before: Date
): Promise<TimeBlockEvent[]> {
    return (await db.read_events_range(conn, after, before)).map(
        event_from_schema
    );
}
export async function create_event(
    conn: Database,
    event: TimeBlockEvent
): Promise<TimeBlockEvent> {
    const queryResult = await db.create_event(conn, event_to_schema(event));
    return event_from_schema(queryResult[0]);
}
export async function update_event(conn: Database, event: TimeBlockEvent) {
    return await db.update_event(conn, event_to_schema(event));
}
export async function delete_event(conn: Database, event: TimeBlockEvent) {
    return await db.delete_event(conn, event_to_schema(event));
}

/**
 * Reconciles the events stored by the database:
 * - Deletes events that no longer exist from the db;
 * - Updates rows of modified events;
 * - Creates new rows for created events.
 * @param conn Database connection
 * @param events Events stored in the frontend representation
 */
export async function store_events(conn: Database, events: TimeBlockEvent[]) {
    const existing = await db.read_all_events(conn);
    const schema_events = events.map(event_to_schema);
    const deleted_events = existing.filter(
        (e) => !schema_events.map((ev) => ev.id).includes(e.id)
    );
    const updated_events = schema_events.filter((ev) =>
        existing.map((e) => e.id).includes(ev.id)
    );
    const created_events = schema_events.filter(
        (ev) => !existing.map((e) => e.id).includes(ev.id)
    );
    await db.delete_events(conn, deleted_events);
    await db.update_events(conn, updated_events);
    await db.create_events(conn, created_events);
}
