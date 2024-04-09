use chrono::{DateTime, Duration, Utc};
use rrule::{RRuleSet, Tz};

// BEGIN:VEVENT
// SUMMARY:Abraham Lincoln
// UID:c7614cff-3549-4a00-9152-d25cc1fe077d
// SEQUENCE:0
// STATUS:CONFIRMED
// TRANSP:TRANSPARENT
// RRULE:FREQ=YEARLY;INTERVAL=1;BYMONTH=2;BYMONTHDAY=12
// DTSTART:20080212
// DTEND:20080213
// DTSTAMP:20150421T141403
// CATEGORIES:U.S. Presidents,Civil War People
// LOCATION:Hodgenville\, Kentucky
// GEO:37.5739497;-85.7399606
// DESCRIPTION:Born February 12\, 1809\nSixteenth President (1861-1865)\n\n\n
//  \nhttp://AmericanHistoryCalendar.com
// URL:http://americanhistorycalendar.com/peoplecalendar/1,328-abraham-lincol
//  n
// END:VEVENT
struct ICalEvent {
    summary: String,
    duration: Duration,
    rrule: RRuleSet,
}
impl ICalEvent {
    pub fn new(
        summary: &str,
        dtstart: DateTime<Tz>,
        dtend: DateTime<Tz>,
        rrule: RRuleSet,
    ) -> Self {
        Self {
            summary: summary.to_owned(),
            duration: dtend - dtstart,
            rrule: rrule.after(dtstart),
        }
    }
}

#[derive(Debug)]
struct ChronicleEvent {
    summary: String,
    start: DateTime<Utc>,
    end: DateTime<Utc>,
}

fn get_event_dates(
    event: ICalEvent,
    after: DateTime<Tz>,
    before: DateTime<Tz>,
) -> Vec<DateTime<Tz>> {
    event.rrule.before(before).after(after).all(65535).dates
}

fn get_event_occurrences(
    event: ICalEvent,
    after: DateTime<Tz>,
    before: DateTime<Tz>,
) -> Vec<ChronicleEvent> {
    event
        .rrule
        .before(before)
        .after(after)
        .all(65535)
        .dates
        .into_iter()
        .map(|date| {
            let start = date.with_timezone(&Utc);
            let end = start + event.duration;
            ChronicleEvent {
                summary: event.summary.clone(),
                start,
                end,
            }
        })
        .collect()
}

fn get_events_in_range(
    events: Vec<ICalEvent>,
    after: DateTime<Tz>,
    before: DateTime<Tz>,
) -> Vec<ChronicleEvent> {
    events
        .into_iter()
        .flat_map(|event| get_event_occurrences(event, after, before))
        .collect()
}

#[cfg(test)]
mod tests {
    use chrono::{TimeZone, Utc};

    use crate::events::ical::ICalEvent;

    #[test]
    fn test_get_event_occurrences() {
        let tz = rrule::Tz::UTC;
        let now = Utc::now().with_timezone(&tz);
        let end = now + chrono::Duration::days(7 * 30);
        let start = now - chrono::Duration::days(7 * 30);
        let ical_event = ICalEvent::new(
            "Abraham Lincoln",
            tz.with_ymd_and_hms(2008, 2, 12, 0, 0, 0).unwrap(),
            tz.with_ymd_and_hms(2008, 2, 12, 23, 59, 59).unwrap(),
            "DTSTART:20080212\nFREQ=YEARLY;INTERVAL=1;BYMONTH=2;BYMONTHDAY=12"
                .parse()
                .unwrap(),
        );
        let result = super::get_event_occurrences(ical_event, start, end);
        println!("{:?}", result);
    }

    #[test]
    fn test_get_events_in_range() {
        let tz = rrule::Tz::UTC;
        let now = Utc::now().with_timezone(&tz);
        let end = now + chrono::Duration::days(7 * 30);
        let start = now - chrono::Duration::days(7 * 30);
        let ical_events = vec![ICalEvent::new(
            "Abraham Lincoln",
            tz.with_ymd_and_hms(2008, 2, 12, 2, 0, 0).unwrap(),
            tz.with_ymd_and_hms(2008, 2, 13, 2, 0, 0).unwrap(),
            "DTSTART:20080212\nFREQ=YEARLY;INTERVAL=1;BYMONTH=2;BYMONTHDAY=12"
                .parse()
                .unwrap(),
        ), ICalEvent::new(
            "George Washington",
            tz.with_ymd_and_hms(2008, 2, 22, 2, 0, 0).unwrap(),
            tz.with_ymd_and_hms(2008, 2, 23, 2, 0, 0).unwrap(),
            "DTSTART:20080222\nFREQ=YEARLY;INTERVAL=1;BYMONTH=2;BYMONTHDAY=22"
                .parse()
                .unwrap(),
        )];
        let result = super::get_events_in_range(ical_events, start, end);
        println!("{:?}", result);
    }
}
