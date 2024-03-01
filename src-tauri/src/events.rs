#![allow(dead_code)]

use std::ops::Range;

use chrono::{DateTime, Duration, Local, NaiveDate, Timelike, Utc};

pub struct Task {
    pub date: NaiveDate,
    pub name: String,
}

impl Task {
    pub fn new(name: &str, date: NaiveDate) -> Self {
        Self {
            date,
            name: name.to_owned(),
        }
    }
    pub fn new_today(name: &str) -> Self {
        Self::new(name, Local::now().date_naive())
    }

    pub fn manual_schedule(
        &self,
        start: DateTime<Utc>,
        duration: Duration,
    ) -> Event {
        Event::new(self.name.as_str(), start, duration)
    }
}

pub struct DynamicTaskDuration(Range<Duration>);

#[derive(Debug, Clone)]
pub struct Event {
    name: String,
    start: DateTime<Utc>,
    duration: Duration,
    completed_on: Option<DateTime<Utc>>,
}
impl Event {
    pub fn new(name: &str, start: DateTime<Utc>, duration: Duration) -> Self {
        Self {
            name: name.to_owned(),
            start,
            duration,
            completed_on: None,
        }
    }

    pub fn is_completed(&self) -> bool {
        self.completed_on.is_some()
    }
    /// Marks the event as completed at the current time.
    /// The event's duration is set to the actual time it took to complete the event.
    pub fn mark_completed(&mut self) {
        let now = Utc::now();
        let now = now.with_nanosecond(0).expect("nano should be valid");
        self.completed_on = Some(now);
        self.duration = now - self.start;
    }
    pub fn is_ongoing(&self) -> bool {
        self.start <= Utc::now() && self.start + self.duration >= Utc::now()
    }

    pub fn check_collision_with(
        &self,
        other_start: DateTime<Utc>,
        other_duration: Duration,
    ) -> Option<Collision> {
        let self_end = self.start + self.duration;
        let other_end = other_start + other_duration;

        // top of event collides with other event
        let top_collision = self.start < other_end && self_end >= other_end;
        // bottom of new event collides with other event
        let bottom_collision =
            self.start <= other_start && self_end > other_start;

        if top_collision && bottom_collision {
            return Some(Collision::Full {
                start: self.start,
                end: self_end,
            });
        }
        if top_collision {
            return Some(Collision::Top { start: self.start });
        }
        if bottom_collision {
            return Some(Collision::Bottom { end: self_end });
        }
        None
    }
}

#[derive(Debug, Clone, Copy)]
pub enum Collision {
    Top {
        start: DateTime<Utc>,
    },
    Bottom {
        end: DateTime<Utc>,
    },
    Full {
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    },
}
