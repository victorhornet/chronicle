import { useCallback, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
    Duration,
    add,
    format,
    parse,
    startOfWeek,
    getDay,
    interval,
    intervalToDuration,
    sub,
} from "date-fns";
import enUS from "date-fns/locale/en-US";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

type Event = {
    id: number;
    title: string;
    start: Date;
    duration: Duration;
    allDay?: boolean;
    static?: boolean;
    resizable: boolean;
    // end: Date;
};
const getEnd = (event: Event) => add(event.start, event.duration);
// const duration = (event: Event) => intervalToDuration(event);

const DnDCalendar = withDragAndDrop(Calendar);

type RescheduleEventArgs = {
    event: Event;
    start: Date;
    end: Date;
    allDay: boolean;
};

export type MyCalendarProps = {
    draggedTask: string | null;
    resetDraggedTask: () => void;
};
function MyCalendar({ draggedTask, resetDraggedTask }: MyCalendarProps) {
    const [events, setEvents] = useState<Event[]>([
        {
            id: 3,
            title: "Appointment",
            start: new Date(2024, 2, 7, 8), // Note: JavaScript months are 0-based
            duration: { hours: 1, minutes: 15 },
            allDay: false,
            static: true,
            resizable: true,
        },
        {
            id: 2,
            title: "Vacation",
            start: new Date(2024, 2, 5, 22),
            duration: { hours: 1, minutes: 59 },
            allDay: false,
            resizable: true,
        },
        {
            id: 1,
            title: "💤 Sleep",
            start: new Date(2024, 2, 5, 18),
            duration: { hours: 8 },
            allDay: false,
            resizable: true,
        },
        {
            id: 0,
            title: "Pacation",
            start: new Date(2024, 2, 5, 20),
            duration: { hours: 3, minutes: 59 },
            allDay: false,
            resizable: true,
        },
        // Add more events here
    ]);

    const checkCollisions = useCallback(
        (event: Event): (Collision | null)[] => {
            const collisions = events
                .filter((ev) => ev.id !== event.id)
                .map((other) => {
                    const event_end = getEnd(event);
                    const other_end = getEnd(other);

                    if (
                        other.start === event.start &&
                        other_end === event_end
                    ) {
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
        },
        [events],
    );

    const scheduleFlexibleEvent = useCallback(
        (event: Event) => {
            let rescheduledEvent = { ...event };
            checkCollisions(event).forEach((col) => {
                switch (col?.colType) {
                    case "startCollides":
                        rescheduledEvent = {
                            ...rescheduledEvent,
                            start: col.otherEnd,
                            duration: intervalToDuration(
                                interval(
                                    rescheduledEvent.start,
                                    sub(
                                        getEnd(rescheduledEvent),
                                        intervalToDuration(
                                            interval(
                                                rescheduledEvent.start,
                                                col.otherEnd,
                                            ),
                                        ),
                                    ),
                                ),
                            ),
                        };
                        break;
                    case "endCollides":
                        rescheduledEvent = {
                            ...rescheduledEvent,
                            duration: intervalToDuration(
                                interval(
                                    rescheduledEvent.start,
                                    col.otherStart,
                                ),
                            ),
                        };
                        break;
                    default:
                        break;
                }
            });
            return rescheduledEvent;
        },
        [events, checkCollisions],
    );

    const manuallyScheduleEvent = useCallback(
        ({ event, start, end, allDay }: RescheduleEventArgs) => {
            setEvents((prev) => {
                const duration = intervalToDuration(interval(start, end));
                const newEvent: Event = scheduleFlexibleEvent({
                    ...event,
                    allDay,
                    start,
                    duration,
                });
                const existing = prev.find((ev) => ev.id === event.id) ?? {};
                const filtered = prev.filter((ev) => ev.id !== event.id);
                return [...filtered, { ...existing, ...newEvent }];
            });
        },
        [setEvents, scheduleFlexibleEvent],
    );

    type Collision =
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

    const createEvent = useCallback(
        ({ start, end, allDay }: RescheduleEventArgs) => {
            setEvents((prev) => {
                const eventName = draggedTask ?? newEventPopup();
                if (eventName === null || eventName === "") {
                    return prev;
                }
                const duration = intervalToDuration(interval(start, end));
                const newEvent: Event = {
                    id: prev.length,
                    title: eventName,
                    resizable: true,
                    allDay: allDay ?? false,
                    start,
                    duration,
                };
                if (draggedTask !== null) {
                    resetDraggedTask();
                }
                return [...prev, newEvent];
            });
        },
        [draggedTask, setEvents],
    );

    // ES
    // EB OS
    // EE OB
    //    OE

    return (
        <div className="h-full flex-auto">
            <DnDCalendar
                localizer={localizer}
                events={events}
                allDayMaxRows={2}
                dayLayoutAlgorithm="no-overlap"
                defaultView="week"
                showMultiDayTimes={true}
                //@ts-ignore
                draggableAccessor={(event) => !(event.static ?? false)}
                //@ts-ignore
                endAccessor={getEnd}
                //@ts-ignore
                allDayAccessor={(e) => e.allDay}
                //@ts-ignore
                onEventDrop={manuallyScheduleEvent}
                //@ts-ignore
                onEventResize={manuallyScheduleEvent}
                //@ts-ignore
                onDropFromOutside={createEvent}
                //@ts-ignore
                onSelectSlot={createEvent}
                resizable
                selectable
                resizableAccessor={() => true}
            />
        </div>
    );
}

//todo prompt is not supported by tauri, have an actual pop up
function newEventPopup() {
    return prompt("Event name:", "Unnamed Event");
}

export default MyCalendar;
