use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_categories_table",
            sql: "CREATE TABLE categories (title TEXT PRIMARY KEY, color TEXT);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_initial_event_table",
            sql: "CREATE TABLE events (id INTEGER PRIMARY KEY AUTOINCREMENT, summary TEXT, start DATETIME, duration TIME, category TEXT, FOREIGN KEY (category) REFERENCES categories(title));",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "insert_demo_event",
            sql: "INSERT INTO events (summary, start, duration) VALUES (\"test\", datetime(), time());",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "insert_demo_categories",
            sql: "INSERT INTO categories (title, color) VALUES (\"Work\", \"#FF0000\"), (\"Default\", \"#0000FF\");",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "insert_more_demo_categories",
            sql: "INSERT INTO categories (title, color) VALUES (\"Recovery\", \"#03fc52\"), (\"Study\", \"#fcba03\"), (\"Social\", \"#e52ce8\"), (\"Filler\",\"#4f4f4f\");",
            kind: MigrationKind::Up
        }
    ]
}
