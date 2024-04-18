import {
    Duration,
    add,
    areIntervalsOverlapping,
    interval,
    intervalToDuration,
    milliseconds,
    millisecondsToMinutes,
    sub,
} from 'date-fns';

export const MINUTES_PER_SLOT = 15;
export const TOTAL_SLOTS_PER_DAY = toSlots(hours(24));
export const PERCENTAGE_PER_SLOT =
    Math.floor(10000 / TOTAL_SLOTS_PER_DAY) / 100;
export const PIXELS_PER_SLOT = 20;

/**
 * Compares two dates for equality, ignoring time.
 * @returns true if the dates have the same day, month, and year
 */
export function getDateEquality(date1: Date, date2: Date) {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

/**
 * Checks if the given date is today, ignoring time.
 * @returns true if the date is today
 */
export function isToday(date: Date) {
    return getDateEquality(date, new Date());
}

/**
 * Adds the given number of milliseconds to the given date and returns a new date.
 * @param date the date to add to
 * @param millis the duration to add
 * @returns the new date resulting from the addition
 */
export function dateAdd(date: Date, millis: number) {
    return new Date(date.getTime() + millis);
}

/**
 * Subtracts the given number of milliseconds from the given date and returns a new date.
 * @param date the date to subtract from
 * @param millis the duration to subtract
 * @returns the new date resulting from the subtraction
 */
export function dateSub(date: Date, millis: number) {
    return new Date(date.getTime() - millis);
}

/**
 * Returns a duration from the given number of months
 * @param months number of months
 * @returns millisecond equivalent of months
 */
export function months(months: number) {
    return days(months * 30);
}

/**
 * Returns a duration from the given number of days
 * @param days number of days
 * @returns millisecond equivalent of days
 */
export function days(days: number) {
    return hours(days * 24);
}

/**
 * Returns a duration from the given number of hours
 * @param hours number of hours
 * @returns millisecond equivalent of hours
 */
export function hours(hours: number) {
    return minutes(hours * 60);
}

/**
 * Returns a duration from the given number of minutes
 * @param minutes number of minutes
 * @returns millisecond equivalent of minutes
 */
export function minutes(minutes: number) {
    return seconds(minutes * 60);
}

/**
 * Returns a duration from the given number of seconds
 * @param seconds number of seconds
 * @returns millisecond equivalent of seconds
 */
export function seconds(seconds: number) {
    return millis(seconds * 1000);
}

/**
 * Returns a duration from the given number of milliseconds. This is a no-op, declared for clarity.
 * @param millis number of milliseconds
 * @returns the given number of milliseconds
 */
export function millis(millis: number) {
    return millis;
}

export function toSeconds(millis: number) {
    return Math.floor(millis / 1000);
}

/**
 * Converts a duration to minutes, removing its second and millis overflow.
 * @param millis the duration in milliseconds
 * @returns the duration to minute precision, in minutes
 */
export function toMinutes(millis: number) {
    return Math.floor(toSeconds(millis) / 60);
}

export function toHours(millis: number) {
    return Math.floor(toMinutes(millis) / 60);
}

export function toDays(millis: number) {
    return Math.floor(toHours(millis) / 24);
}

/**
 * Converts a duration to slots, removing its second and millis overflow.
 * @param millis the duration in milliseconds
 * @returns the duration to slot precision, in slots
 */
export function toSlots(millis: number) {
    return Math.floor(toMinutes(millis) / MINUTES_PER_SLOT);
}

/**
 * Converts the given number of slots to a duration in milliseconds.
 * @param slots the amount of slots
 * @returns the duration in milliseconds
 */
export function fromSlots(slots: number) {
    return minutes(slots * MINUTES_PER_SLOT);
}

/**
 * Removes the time from the given date and returns a new date.
 * @param date the date to remove the time from
 * @returns a new date with the time removed
 */
export function removeTime(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Removes the date from the given date and returns a new date.
 * @param date the date to remove the date from
 * @returns a new date with the date removed
 */
export function removeDate(date: Date) {
    return new Date(0, 0, 0, date.getHours(), date.getMinutes());
}

/**
 * Normalizes a date to perfectly fit into the given slot size.
 * @param date the date to normalize
 * @returns a new date, with the seconds and millis removed, and the minutes rounded to the nearest multiple of the slot size
 */
export function normalizeDate(date: Date) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        normalizeMinutes(date.getMinutes())
    );
}

/**
 * Normalizes a duration to perfectly fit into the given slot size.
 * @param minutes the duration to normalize
 * @returns the duration, rounded to the nearest multiple of the slot size
 */
export function normalizeMinutes(minutes: number) {
    return Math.floor(minutes / MINUTES_PER_SLOT) * MINUTES_PER_SLOT;
}

/**
 * Converts a date to a slot number, relative to the start of the day.
 * @param date the date to convert
 * @returns the slot number
 */
export function dateToSlot(date: Date) {
    const normalizedDate = normalizeDate(date);
    const midnight = removeTime(normalizedDate);
    return toSlots(normalizedDate.getTime() - midnight.getTime()) + 1;
}

/**
 * Converts a slot number to a date, relative to the start of the day.
 * @param slot the slot number
 * @param date the date to use as the base, defaults to today
 * @returns the date
 */
export function slotToDate(slot: number, date: Date = new Date()) {
    const midnight = removeTime(date);
    return dateAdd(midnight, fromSlots(slot));
}

export type GridPos = {
    col: number;
    row: number;
};

export function addDurs(dur1: Duration, dur2: Duration): Duration {
    return { seconds: toSeconds(milliseconds(dur1) + milliseconds(dur2)) };
}

export function subDurs(dur1: Duration, dur2: Duration): Duration {
    return { seconds: toSeconds(milliseconds(dur1) - milliseconds(dur2)) };
}

export function durationBetween(lhs: Date, rhs: Date): Duration {
    return intervalToDuration(interval(lhs, rhs));
}

/**
 * Subtracts two dates and returns the Duration between them.
 * @param lhs the left hand side of the `-` sign
 * @param rhs the right hand side of the `-` sign
 * @returns `lhs - rhs` as a duration
 */
export function subDates(lhs: Date, rhs: Date): Duration {
    return intervalToDuration(interval(rhs, lhs));
}

// export function seconds(duration: Duration) {
//     return toSeconds(milliseconds(duration));
// }

export type Collision =
    | {
          colType: 'overlapsOther';
      }
    | {
          colType: 'containsOther';
      }
    | {
          colType: 'containedByOther';
      }
    | {
          colType: 'startCollides';
          otherEnd: Date;
      }
    | {
          colType: 'endCollides';
          otherStart: Date;
      };

export function toInterval(event: Event): { start: Date; end: Date } {
    return interval(event.start, getEnd(event));
}

export function findCollisions(
    event: Event,
    events: Event[]
): (Collision | null)[] {
    const collisions = events
        .filter(
            (ev) =>
                ev.id !== event.id &&
                areIntervalsOverlapping(toInterval(event), toInterval(ev))
        )
        .map((other) => {
            const event_end = getEnd(event);
            const other_end = getEnd(other);

            if (other.start === event.start && other_end === event_end) {
                const res: Collision = { colType: 'overlapsOther' };
                return res;
            }
            if (event.start < other.start && other_end < event_end) {
                const res: Collision = { colType: 'containsOther' };
                return res;
            }
            if (other.start < event.start && event_end < other_end) {
                const res: Collision = { colType: 'containedByOther' };
                return res;
            }
            if (other.start <= event.start && event.start < other_end) {
                const res: Collision = {
                    colType: 'startCollides',
                    otherEnd: other_end,
                };
                return res;
            }
            if (other.start < event_end && event_end <= other_end) {
                const res: Collision = {
                    colType: 'endCollides',
                    otherStart: other.start,
                };
                return res;
            }
            return null;
        })
        .filter((collision) => collision !== null);

    return collisions;
}

export function growEvent(event: Event, others: Event[]): Event {
    const startDay = removeTime(event.start);
    const endDay = removeTime(getEnd(event));
    const endBorder = add(endDay, { hours: 23, minutes: 59 });
    const sortedEvents = [...others]
        .map((ev) => {
            return { ...ev, end: getEnd(ev) };
        })
        .filter(
            (ev) =>
                ev.id !== event.id &&
                (removeTime(ev.start).getTime() === endDay.getTime() ||
                    removeTime(ev.end).getTime() === startDay.getTime())
        )
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    const newEvent = { ...event };
    for (let i = 0; i <= sortedEvents.length; i++) {
        const freeSlotStart = sortedEvents[i]?.end ?? startDay;
        const freeSlotEnd = sortedEvents[i + 1]?.start ?? endBorder;
        const freeSlot = interval(freeSlotStart, freeSlotEnd);
        console.log(freeSlot);

        if (!areIntervalsOverlapping(toInterval(event), freeSlot)) {
            continue;
        }
        if (freeSlotStart < event.start) {
            const minStart =
                newEvent.schedulingConstraints?.startTime?.minStart;
            newEvent.start =
                minStart === undefined ||
                minStart.getTime() < freeSlotStart.getTime()
                    ? freeSlotStart
                    : minStart;
        }
        if (getEnd(newEvent) < freeSlotEnd) {
            const maxEnd = newEvent.schedulingConstraints?.endTime?.maxEnd;
            const newEnd =
                maxEnd === undefined || freeSlotEnd < maxEnd
                    ? freeSlotEnd
                    : maxEnd;
            newEvent.duration = durationBetween(newEvent.start, newEnd);
        }
    }
    console.log(newEvent);

    return newEvent;
}

export const DEFAULT_CATEGORY = 'Default' as const;
export type EventNoId = {
    title: string;
    start: Date;
    duration: Duration;
    allDay?: boolean;
    schedulingConstraints?: ScheduleConstraints;
    static?: boolean;
    resizable: boolean;
    color?: Color;
    categoryOverride?: string;
    // end: Date;
};
export type Event = EventNoId & { id: string };

export type TimeSlot = {
    id: number;
    title: string;
    start: Date;
    duration: Duration;
    days: DayOfWeekNum[];
    color: Color;
    timeslot: true;
};

export const WORKDAYS: DayOfWeekNum[] = [1, 2, 3, 4, 5];
export const WEEKEND: DayOfWeekNum[] = [0, 6];
export const WEEKDAYS: DayOfWeekNum[] = [0, 1, 2, 3, 4, 5, 6];

export type Color =
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'cyan'
    | 'purple'
    | 'pink'
    | 'brown'
    | 'grey'
    | 'black'
    | 'white';

export function getEnd(event: Event) {
    return add(event.start, event.duration);
}

export type ScheduleConstraints = {
    durationConstraint?: DurationConstraint;
    startTime?: StartTimeConstraint;
    endTime?: EndTimeConstraint;
    allowedDays?: AllowedDaysConstraint;
};

type ScheduleResult =
    | { scheduleSuccess: true; event: Event }
    | { scheduleSuccess: false };
export function checkConstraints(
    event: Event,
    tries: number = 5
): ScheduleResult {
    const start = event.start;
    const end = getEnd(event);
    if (event.schedulingConstraints === undefined) {
        return milliseconds(event.duration) > 0
            ? { event, scheduleSuccess: true }
            : { scheduleSuccess: false };
    }
    const constraints = event.schedulingConstraints;
    if (constraints.durationConstraint !== undefined) {
        if (tries <= 0) {
            return { scheduleSuccess: false };
        }
        console.log(event.duration, constraints.durationConstraint);
        const minDuration = constraints.durationConstraint.minDuration;
        const maxDuration = constraints.durationConstraint.maxDuration;
        const duration = milliseconds(event.duration);
        if (duration < milliseconds(minDuration)) {
            return { scheduleSuccess: false };
        }
        if (maxDuration !== undefined && duration > milliseconds(maxDuration)) {
            return checkConstraints(
                { ...event, duration: maxDuration },
                tries - 1
            );
        }
    }
    if (constraints.startTime !== undefined) {
        if (tries <= 0) {
            return { scheduleSuccess: false };
        }
        const startTime = removeDate(start);
        if (
            startTime.getTime() <
            removeDate(constraints.startTime.minStart).getTime()
        ) {
            return checkConstraints(
                {
                    ...event,
                    start: add(removeTime(start), {
                        hours: constraints.startTime.minStart.getHours(),
                        minutes: constraints.startTime.minStart.getMinutes(),
                    }),
                },
                tries - 1
            );
        }
        if (
            constraints.startTime.maxStart !== undefined &&
            startTime.getTime() >
                removeDate(constraints.startTime.maxStart).getTime()
        ) {
            return checkConstraints(
                {
                    ...event,
                    start: add(removeTime(start), {
                        hours: constraints.startTime.maxStart.getHours(),
                        minutes: constraints.startTime.maxStart.getMinutes(),
                    }),
                },
                tries - 1
            );
        }
    }
    if (constraints.endTime !== undefined) {
        if (tries <= 0) {
            return { scheduleSuccess: false };
        }
        const endTime = removeDate(end);
        if (
            endTime.getTime() < removeDate(constraints.endTime.minEnd).getTime()
        ) {
            return checkConstraints(
                {
                    ...event,
                    duration: durationBetween(
                        event.start,
                        add(removeTime(start), {
                            hours: constraints.endTime.minEnd.getHours(),
                            minutes: constraints.endTime.minEnd.getMinutes(),
                        })
                    ),
                },
                tries - 1
            );
        }
        if (
            constraints.endTime.maxEnd !== undefined &&
            endTime.getTime() > removeDate(constraints.endTime.maxEnd).getTime()
        ) {
            return checkConstraints(
                {
                    ...event,
                    duration: durationBetween(
                        event.start,
                        add(removeTime(start), {
                            hours: constraints.endTime.maxEnd.getHours(),
                            minutes: constraints.endTime.maxEnd.getMinutes(),
                        })
                    ),
                },
                tries - 1
            );
        }
    }
    if (constraints.allowedDays !== undefined) {
        if (tries <= 0) {
            return { scheduleSuccess: false };
        }
        if (
            !constraints.allowedDays.days.includes(
                start.getDay() as DayOfWeekNum
            )
        ) {
            return { scheduleSuccess: false };
        }
    }
    return { scheduleSuccess: true, event };
}

/**
 * Ensures that the event's duration will be in the given range.
 */
type DurationConstraint = {
    minDuration: Duration;
    maxDuration?: Duration;
};

/**
 * Forces the scheduler to use only the given start time for the event. Only the time of day matters
 */
type StartTimeConstraint = {
    minStart: Date;
    maxStart?: Date;
};

/**
 * Forces the scheduler to use only the given end time for the event. Only the time of day matters
 */
type EndTimeConstraint = {
    minEnd: Date;
    maxEnd?: Date;
};

/**
 * Forces the scheduler to use only the given days for the event.
 */
type AllowedDaysConstraint = {
    days: DayOfWeekNum[];
};

type DayOfWeekNum = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Reschedules upcoming events to fit their constraints.
 * If the event cannot be rescheduled, it is left as is.
 * First, the event's duration is increased to fit the constraints.
 * (todo) Then, the event's start time is adjusted to fit the constraints.
 * (todo) Finally, the event's end time is adjusted to fit the constraints.
 * @param events to reschedule
 * @returns updated list of events
 */
export function reschedule(events: Event[]): Event[] {
    const passed = events.filter(
        (event) => event.start.getTime() < new Date().getTime()
    );
    const upcoming = events.filter(
        (event) => event.start.getTime() >= new Date().getTime()
    );
    upcoming.sort((a, b) => a.start.getTime() - b.start.getTime());
    for (let i = 0; i < upcoming.length; i++) {
        const event = upcoming[i];
        const next = upcoming[i + 1];
        if (next === undefined) {
            break;
        }
        const rescheduleResult = checkConstraints({
            ...event,
            duration: durationBetween(event.start, next.start),
        });
        if (rescheduleResult.scheduleSuccess) {
            upcoming[i] = rescheduleResult.event;
        }
    }
    // const schedulingInterval = interval(
    //     upcoming[0].start,
    //     add(getEnd(upcoming[upcoming.length - 1]), { days: 1 }),
    // );
    return [...passed, ...upcoming];
}

/**
 * Filters the given events to only include those that are scheduled for the given day.
 * @returns a new array containing only the events that are scheduled for the given day
 */
export function filterDaysEvents(day: Date, events: Event[]): Event[] {
    return events.filter((event) => getDateEquality(event.start, day));
}

/**
 * Filters the given events to only include those that are scheduled for the given week.
 * @returns a new array containing only the events that are scheduled for the given week
 */
export function filterWeeksEvents(day: Date, events: Event[]): Event[] {
    const dayOfWeek = day.getDay();
    const start = removeTime(sub(day, { days: dayOfWeek }));
    const end = add(start, { days: 7 });
    return events.filter(
        (event) =>
            event.start.getTime() >= start.getTime() &&
            event.start.getTime() < end.getTime()
    );
}

export function extractCategoryHours(events: Event[]): {
    [key: string]: number;
} {
    let categories: {
        [key: string]: number;
    } = {};
    events.forEach((event) => {
        const category = event.categoryOverride ?? DEFAULT_CATEGORY;
        if (categories[category] === undefined) {
            categories[category] = 0;
        }

        categories[category] += millisecondsToMinutes(
            milliseconds(event.duration)
        );
    });
    return categories;
}

export function analyzeDay(
    day: Date,
    events: Event[]
): {
    totalMinutes: number;
    categoryMinutes: { [key: string]: number };
    categoryPercentages: [string, number][];
} {
    const todays = filterDaysEvents(day, events);
    const categoryMinutes = extractCategoryHours(todays);
    const totalMinutes = MINUTES_IN_DAY;
    const categoryPercentages: [string, number][] = Object.entries(
        categoryMinutes
    ).map(([category, minutes]) => [category, (minutes / totalMinutes) * 100]);
    return { totalMinutes, categoryMinutes, categoryPercentages };
}

export function analyzeWeek(
    day: Date,
    events: Event[]
): {
    totalMinutes: number;
    categoryMinutes: { [key: string]: number };
    categoryPercentages: [string, number][];
} {
    const weeks = filterWeeksEvents(day, events);
    const categoryMinutes = extractCategoryHours(weeks);
    const totalMinutes = MINUTES_IN_DAY * 7;
    const categoryPercentages: [string, number][] = Object.entries(
        categoryMinutes
    ).map(([category, minutes]) => {
        return [category, (minutes / totalMinutes) * 100];
    });
    return { totalMinutes, categoryMinutes, categoryPercentages };
}

const MINUTES_IN_DAY = 1440;
