import Database from '@tauri-apps/plugin-sql';

/**
 * Creates a new connection to the sqlite database.
 */
export async function connect() {
    // sqlite. The path is relative to `tauri::api::path::BaseDirectory::App`.
    return await Database.load('sqlite:chronicle.db');
}
