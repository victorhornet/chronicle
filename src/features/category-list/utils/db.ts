import Database from '@tauri-apps/plugin-sql';
import { SchemaCategory } from '../types/schema';

export async function createCategory(
    conn: Database,
    title: string,
    color: string
) {
    return await conn.execute(
        'INSERT INTO categories (title, color) VALUES ($1, $2);',
        [title, color]
    );
}

export async function readCategories(
    conn: Database
): Promise<SchemaCategory[]> {
    return await conn.select('SELECT * FROM categories;');
}
