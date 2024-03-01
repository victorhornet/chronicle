//! Reads and manages Notes Directory configuration files

#![allow(dead_code)]

use serde::Deserialize;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

const CONFIG_FILE: &str = "config.toml";

#[derive(Debug, Deserialize)]
pub struct Config {
    pub daily_logs_dir: Option<String>,
    pub weekly_logs_dir: Option<String>,
    pub monthly_logs_dir: Option<String>,
}

/// Tries to open and parse the config file in the given directory
pub fn parse(root_path: &Path) -> Config {
    let config_path = root_path.join(CONFIG_FILE);
    let mut file = File::open(config_path).expect("Config file not found");
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .expect("Failed to read config file");
    toml::from_str(&contents).expect("Failed to parse config file")
}
