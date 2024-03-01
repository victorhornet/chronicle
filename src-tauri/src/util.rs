use chrono::{DateTime, Duration, Local, TimeZone, Timelike, Utc};
pub use color_eyre::eyre::{anyhow, bail, ensure, Result};

pub const PIXELS_PER_SLOT: i64 = 10;
pub const PIXELS_PER_MINUTE: i64 = PIXELS_PER_SLOT / MINUTES_PER_SLOT;
pub const MINUTES_PER_SLOT: i64 = 5;

pub const ONE_HOUR_SLOTS: i64 = 60 / MINUTES_PER_SLOT;
pub const SLOTS_PER_DAY: i64 = 24 * ONE_HOUR_SLOTS;
pub const PIXELS_PER_DAY: i64 = SLOTS_PER_DAY * PIXELS_PER_SLOT;

pub const DAY_COL_WIDTH: (f32, f32) = (500.0, 1000.0);

/// Returns the slot offset from the top of the day grid for the given datetime.
pub fn time_to_slots(datetime: DateTime<Utc>) -> i64 {
    let local_datetime = datetime
        .naive_local()
        .with_second(0)
        .unwrap()
        .with_nanosecond(0)
        .unwrap();
    let day_start = local_datetime
        .date()
        .and_hms_opt(0, 0, 0)
        .expect("valid time");
    let duration = local_datetime - day_start;
    duration_to_slots(duration)
}

/// Returns the datetime equivalent to the given slot number.
pub fn slots_to_time(slots: i64) -> DateTime<Utc> {
    let duration = slots_to_duration(slots);
    let day_start = today().and_hms_opt(0, 0, 0).expect("valid time");
    let datetime = day_start + duration;
    Utc.from_local_datetime(&datetime).unwrap()
}

/// Returns the duration equivalent to the given amount of slots.
pub fn slots_to_duration(slots: i64) -> Duration {
    Duration::minutes(slots * MINUTES_PER_SLOT)
}

/// Returns the amount of slots for the given duration.
pub fn duration_to_slots(duration: Duration) -> i64 {
    duration.num_minutes() / MINUTES_PER_SLOT
}

/// Returns the slot range for the given event start and duration.
pub fn event_to_slots(start: DateTime<Utc>, duration: Duration) -> (i64, i64) {
    let start_slots = time_to_slots(start);
    let end_slots = start_slots + duration_to_slots(duration);
    (start_slots, end_slots)
}

/// Returns the current UTC datetime with the seconds and nanoseconds set to 0.
pub fn utc_now() -> DateTime<Utc> {
    Utc::now()
        .with_nanosecond(0)
        .unwrap()
        .with_second(0)
        .unwrap()
}

pub fn local_now() -> DateTime<Local> {
    utc_now().into()
}

/// Returns the current date in the local timezone.
pub fn today() -> Date {
    Local::now().date_naive()
}

pub type Date = chrono::NaiveDate;

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_pixel_conversions() {
        let now = utc_now();
        let mps = MINUTES_PER_SLOT as u32; // mps should always fit in a u32
        let now = now.with_minute(now.minute() / mps * mps).unwrap();
        println!("{:?}", now.naive_local());
        let start_slot = time_to_slots(now);
        println!("{:?}", start_slot);
        let start_time = slots_to_time(start_slot);
        assert_eq!(start_time, now);
        let duration = Duration::minutes(30);
        let end_time = start_time + duration;
        let end_slot = time_to_slots(end_time);
        let duration_slots = end_slot - start_slot;
        assert_eq!(duration_slots, duration_to_slots(duration));
    }
}
