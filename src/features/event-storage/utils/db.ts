import Database from '@tauri-apps/plugin-sql';
import { SchemaEvent, SchemaEventNoId } from '../types/schema';

/**
 * Inserts a new event to the database.
 */
export async function create_event(
    conn: Database,
    event: SchemaEventNoId
): Promise<SchemaEvent[]> {
    const res: SchemaEvent[] = await conn.select(
        'INSERT INTO events (summary, start, duration, category) VALUES ($1, $2, $3, $4) RETURNING id, summary, start, duration, category;',
        [event.summary, event.start, event.duration, event.category]
    );
    console.debug(res[0]);
    return res;
}

export async function create_events(conn: Database, events: SchemaEvent[]) {
    //todo optimize transactions
    events.forEach(async (ev) => await create_event(conn, ev));
}

export async function read_all_events(conn: Database): Promise<SchemaEvent[]> {
    return await conn.select('SELECT * FROM events');
}

export async function read_events_range(
    conn: Database,
    after: Date,
    before: Date
): Promise<SchemaEvent[]> {
    return await conn.select(
        'SELECT * FROM events WHERE $1 < start AND start < $2;',
        [after, before]
    );
}

export async function update_event(conn: Database, event: SchemaEvent) {
    return await conn.execute(
        'UPDATE events SET summary = $1, start = $2, duration = $3, category = $4 WHERE id = $5;',
        [event.summary, event.start, event.duration, event.category, event.id]
    );
}

export async function update_events(conn: Database, events: SchemaEvent[]) {
    //todo optimize transactions
    events.forEach(async (ev) => await update_event(conn, ev));
}

export async function delete_event(conn: Database, event: SchemaEvent) {
    return await conn.execute('DELETE FROM events WHERE id = $1;', [event.id]);
}

export async function delete_events(conn: Database, events: SchemaEvent[]) {
    //todo optimize transactions
    events.forEach(async (ev) => await delete_event(conn, ev));
}
