import Database from 'tauri-plugin-sql-api';
import { EventSchema, EventSchemaNoId } from '../types/db';

/**
 * Creates a new connection to the sqlite database.
 */
export async function connect() {
    // sqlite. The path is relative to `tauri::api::path::BaseDirectory::App`.
    return await Database.load('sqlite:chronicle.db');
}

/**
 * Inserts a new event to the database.
 */
export async function create_event(conn: Database, event: EventSchemaNoId) {
    return await conn.execute('INSERT INTO events VALUES ($1, $2, $3);', [
        event.summary,
        event.start,
        event.duration,
    ]);
}

export async function read_all_events(conn: Database) {
    return await conn.execute('SELECT * FROM events;');
}

export async function read_events_range(
    conn: Database,
    after: Date,
    before: Date
) {
    return await conn.execute(
        'SELECT * FROM events WHERE $1 < start AND start < $2;',
        [after, before]
    );
}

export async function update_event(conn: Database, event: EventSchema) {
    return await conn.execute(
        'UPDATE events SET summary = $1, start = $2, duration = $3 WHERE id = $4;',
        [event.summary, event.start, event.duration, event.id]
    );
}

export async function delete_event(conn: Database, event: EventSchema) {
    return await conn.execute('DELETE FROM events WHERE id = $1;', [event.id]);
}
