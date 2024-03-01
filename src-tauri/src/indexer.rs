//! Responsible for reading the files from the disk and indexing their contents.

#![allow(dead_code)]

use crate::config::{self, Config};
use chrono::NaiveDate;
use std::path::Path;
use std::{fs, io};

const DEFAULT_DAILY_LOGS_DIR: &str = "daily";
const DEFAULT_WEEKLY_LOGS_DIR: &str = "weekly";
const DEFAULT_MONTHLY_LOGS_DIR: &str = "monthly";

fn read_files(root_path: &Path) -> io::Result<()> {
    let config = config::parse(root_path);

    index_dailies(root_path, &config)?;
    Ok(())
}

/// Indexes the daily logs
fn index_dailies(root_path: &Path, config: &Config) -> io::Result<()> {
    let daily_dir = root_path.join(
        config
            .daily_logs_dir
            .clone()
            .unwrap_or(DEFAULT_DAILY_LOGS_DIR.to_owned()),
    );
    for file in fs::read_dir(daily_dir)? {
        let file = file?;
        // Only read .md files
        match file.path().extension() {
            Some(ext) if ext == ".md" => {}
            None | Some(_) => continue,
        }
        // Only read files with a valid date format
        let file_path = file.path();
        let file_stem = file_path
            .file_stem()
            .expect("file must be a valid .md file, so it should have a name");
        let _date = match file_stem.to_str() {
            Some(date) => NaiveDate::parse_from_str(date, "%Y-%m-%d").unwrap(),
            None => continue,
        };
        let _contents = fs::read_to_string(file_path)?;
        todo!("parse the contents of the file")
    }
    Ok(())
}

fn _index_weeklies(_weekly_dir: &Path) {
    todo!("weekly logs")
}

fn _index_monthlies(_monthly_dir: &Path) {
    todo!("monthly logs")
}
