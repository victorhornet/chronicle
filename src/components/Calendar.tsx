import { useCallback, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
    format,
    parse,
    startOfWeek,
    getDay,
    interval,
    intervalToDuration,
} from "date-fns";
import {
    Collision,
    durationBetween,
    findCollisions,
    subDurs,
    Event,
    getEnd,
    checkConstraints,
    growEvent,
} from "../utils";
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
            id: 0,
            title: "Pacation",
            start: new Date(2024, 2, 3, 20),
            duration: { hours: 3, minutes: 59 },
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
            schedulingConstraints: {
                durationConstraint: {
                    minDuration: { hours: 7 },
                    maxDuration: { hours: 9 },
                },
            },
        },
        {
            id: 2,
            title: "Vacation",
            start: new Date(2024, 2, 4, 22),
            duration: { hours: 1, minutes: 59 },
            allDay: false,
            resizable: true,
        },

        {
            id: 3,
            title: "Start between 07:00 and 10:00\nEnd between 12:00 and 13:00",
            start: new Date(2024, 2, 7, 8), // Note: JavaScript months are 0-based
            duration: { hours: 1, minutes: 15 },
            allDay: false,
            resizable: true,
            schedulingConstraints: {
                startTime: {
                    minStart: new Date(0, 0, 0, 7, 0),
                    maxStart: new Date(0, 0, 0, 10, 0),
                },
                endTime: {
                    minEnd: new Date(0, 0, 0, 12, 0),
                    maxEnd: new Date(0, 0, 0, 13, 0),
                },
            },
        },
        {
            id: 4,
            title: "Only monday, wednesday, friday",
            start: new Date(2024, 2, 6, 18),
            duration: { hours: 8 },
            allDay: false,
            resizable: true,
            schedulingConstraints: {
                allowedDays: { days: [1, 3, 5] },
            },
        },

        // Add more events here
    ]);

    const checkCollisions = useCallback(
        (event: Event): (Collision | null)[] => findCollisions(event, events),
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
                            duration: subDurs(
                                rescheduledEvent.duration,
                                durationBetween(
                                    rescheduledEvent.start,
                                    col.otherEnd,
                                ),
                            ),
                        };
                        break;
                    case "endCollides":
                        rescheduledEvent = {
                            ...rescheduledEvent,
                            duration: durationBetween(
                                rescheduledEvent.start,
                                col.otherStart,
                            ),
                        };
                        break;
                    default:
                        break;
                }
            });

            return checkConstraints(rescheduledEvent);
        },
        [events, checkCollisions],
    );

    const manuallyScheduleEvent = useCallback(
        ({ event, start, end, allDay }: RescheduleEventArgs) => {
            setEvents((prev) => {
                const duration = intervalToDuration(interval(start, end));
                const result = scheduleFlexibleEvent({
                    ...event,
                    allDay,
                    start,
                    duration,
                });
                if (!result.scheduleSuccess) {
                    return prev;
                }

                const existing = prev.find((ev) => ev.id === event.id) ?? {};
                const filtered = prev.filter((ev) => ev.id !== event.id);
                const newEvents = [
                    ...filtered,
                    { ...existing, ...result.event },
                ];
                return newEvents;
            });
        },
        [setEvents, scheduleFlexibleEvent],
    );

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
                // @ts-ignore
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
