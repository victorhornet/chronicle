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
};
function MyCalendar({ draggedTask }: MyCalendarProps) {
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

    const manuallyRescheduleEvent = useCallback(
        ({ event, start, end, allDay }: RescheduleEventArgs) => {
            const duration = intervalToDuration(interval(start, end));
            const newEvent: Event = {
                ...event,
                allDay,
                start,
                duration,
            };
            setEvents((prev) => {
                const existing = prev.find((ev) => ev.id === event.id) ?? {};
                const filtered = prev.filter((ev) => ev.id !== event.id);
                return [...filtered, { ...existing, ...newEvent }];
            });
        },
        [setEvents],
    );

    const checkCollisions = useCallback(
        (event: Event) => {
            events.map((other) => {
                const event_end = getEnd(event);
                const other_end = getEnd(other);
                const startCollides =
                    other.start <= event.start && event.start < other_end;
                const endCollides =
                    other.start < event_end && event_end <= other_end;
                const containsOther =
                    event.start < other.start && other_end < event_end;
                const isContainedByOther =
                    other.start < event.start && event_end < other_end;
                const overlapsOther =
                    other.start === event.start && other_end === event_end;
                const full_collision = containsOther || isContainedByOther;
                if (!full_collision) {
                }
            });
        },
        [events],
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
                onEventDrop={manuallyRescheduleEvent}
                //@ts-ignore
                onEventResize={manuallyRescheduleEvent}
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
