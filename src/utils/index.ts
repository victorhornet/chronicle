import {
    Duration,
    add,
    areIntervalsOverlapping,
    interval,
    intervalToDuration,
    milliseconds,
    sub,
} from "date-fns";

export const MINUTES_PER_SLOT = 15;
export const TOTAL_SLOTS_PER_DAY = toSlots(hours(24));
export const PERCENTAGE_PER_SLOT =
    Math.floor(10000 / TOTAL_SLOTS_PER_DAY) / 100;
export const PIXELS_PER_SLOT = 20;

/**
 * Compares two dates for equality, ignoring time.
 * @returns true if the dates have the same day, month, and year
 */
export function dateEquals(date1: Date, date2: Date) {
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
    return dateEquals(date, new Date());
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
        normalizeMinutes(date.getMinutes()),
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
          colType: "overlapsOther";
      }
    | {
          colType: "containsOther";
      }
    | {
          colType: "containedByOther";
      }
    | {
          colType: "startCollides";
          otherEnd: Date;
      }
    | {
          colType: "endCollides";
          otherStart: Date;
      };

export function toInterval(event: Event): { start: Date; end: Date } {
    return interval(event.start, getEnd(event));
}

export function findCollisions(
    event: Event,
    events: Event[],
): (Collision | null)[] {
    const collisions = events
        .filter(
            (ev) =>
                ev.id !== event.id &&
                areIntervalsOverlapping(toInterval(event), toInterval(ev)),
        )
        .map((other) => {
            const event_end = getEnd(event);
            const other_end = getEnd(other);

            if (other.start === event.start && other_end === event_end) {
                const res: Collision = { colType: "overlapsOther" };
                return res;
            }
            if (event.start < other.start && other_end < event_end) {
                const res: Collision = { colType: "containsOther" };
                return res;
            }
            if (other.start < event.start && event_end < other_end) {
                const res: Collision = { colType: "containedByOther" };
                return res;
            }
            if (other.start <= event.start && event.start < other_end) {
                const res: Collision = {
                    colType: "startCollides",
                    otherEnd: other_end,
                };
                return res;
            }
            if (other.start < event_end && event_end <= other_end) {
                const res: Collision = {
                    colType: "endCollides",
                    otherStart: other.start,
                };
                return res;
            }
            return null;
        })
        .filter((collision) => collision !== null);
    console.log(collisions);
    return collisions;
}

export type Event = {
    id: number;
    title: string;
    start: Date;
    duration: Duration;
    allDay?: boolean;
    schedulingConstraints?: ScheduleConstraints;
    static?: boolean;
    resizable: boolean;
    // end: Date;
};

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
export function checkConstraints(event: Event): ScheduleResult {
    const start = event.start;
    const end = getEnd(event);
    if (event.schedulingConstraints === undefined) {
        return { event, scheduleSuccess: true };
    }
    const constraints = event.schedulingConstraints;
    if (constraints.durationConstraint !== undefined) {
        console.log(event.duration, constraints.durationConstraint);
        const minDuration = constraints.durationConstraint.minDuration;
        const maxDuration = constraints.durationConstraint.maxDuration;
        const duration = milliseconds(event.duration);
        if (duration < milliseconds(minDuration)) {
            return { scheduleSuccess: false };
        }
        if (maxDuration !== undefined && duration > milliseconds(maxDuration)) {
            return {
                scheduleSuccess: true,
                event: { ...event, duration: maxDuration },
            };
        }
    }
    if (constraints.startTime !== undefined) {
        const startTime = removeDate(start);
        if (
            startTime.getTime() <
            removeDate(constraints.startTime.minStart).getTime()
        ) {
            return { scheduleSuccess: false };
        }
        if (
            constraints.startTime.maxStart !== undefined &&
            startTime.getTime() >
                removeDate(constraints.startTime.maxStart).getTime()
        ) {
            return { scheduleSuccess: false };
        }
    }
    if (constraints.endTime !== undefined) {
        const endTime = removeDate(end);
        if (
            endTime.getTime() < removeDate(constraints.endTime.minEnd).getTime()
        ) {
            return { scheduleSuccess: false };
        }
        if (
            constraints.endTime.maxEnd !== undefined &&
            endTime.getTime() > removeDate(constraints.endTime.maxEnd).getTime()
        ) {
            return { scheduleSuccess: false };
        }
    }
    if (constraints.allowedDays !== undefined) {
        if (
            !constraints.allowedDays.days.includes(
                start.getDay() as DayOfWeekNum,
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

function reschedule(events: Event[]): Event[] {
    const passed = events.filter(
        (event) => event.start.getTime() < new Date().getTime(),
    );
    const upcoming = events.filter(
        (event) => event.start.getTime() >= new Date().getTime(),
    );
    upcoming.sort((a, b) => a.start.getTime() - b.start.getTime());
    const schedulingInterval = interval(
        upcoming[0].start,
        add(getEnd(upcoming[upcoming.length - 1]), { days: 1 }),
    );
    //todo reschedule upcoming events
    return [...passed, ...upcoming];
}
