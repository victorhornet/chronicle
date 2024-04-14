use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create_initial_event_table",
        sql: "CREATE TABLE events (id INTEGER PRIMARY KEY AUTOINCREMENT, summary TEXT, start DATE, duration TIME);",
        kind: MigrationKind::Up,
    },Migration {
        version: 2,
        description: "insert_demo_event",
        sql: "INSERT INTO events (summary, start, duration) VALUES (\"test\", date(), time());",
        kind: MigrationKind::Up,
    }]
}
