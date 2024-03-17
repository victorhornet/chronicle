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
    TimeSlot,
    WORKDAYS,
    WEEKDAYS,
} from "../utils";
import enUS from "date-fns/locale/en-US";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "../styles/Calendar.css";

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
    events: Event[];
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
};
function MyCalendar({
    draggedTask,
    resetDraggedTask,
    events,
    setEvents,
}: MyCalendarProps) {
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
        {
            id: 0,
            title: "Work timeslot",
            start: new Date(2024, 2, 18, 7, 0),
            duration: { hours: 2, minutes: 30 },
            days: WORKDAYS,
            color: "red",
            timeslot: true,
        },
        {
            id: 1,
            title: "Breakfast timeslot",
            start: new Date(2024, 2, 18, 9, 30),
            duration: { minutes: 30 },
            days: WEEKDAYS,
            color: "blue",
            timeslot: true,
        },
        {
            id: 2,
            title: "Work timeslot",
            start: new Date(2024, 2, 18, 10, 0),
            duration: { hours: 3 },
            days: WORKDAYS,
            color: "red",
            timeslot: true,
        },
        {
            id: 3,
            title: "Lunch timeslot",
            start: new Date(2024, 2, 18, 13, 0),
            duration: { minutes: 30 },
            days: WEEKDAYS,
            color: "blue",
            timeslot: true,
        },
        {
            id: 4,
            title: "Walk timeslot",
            start: new Date(2024, 2, 18, 13, 30),
            duration: { minutes: 30 },
            days: WEEKDAYS,
            color: "green",
            timeslot: true,
        },
        {
            id: 5,
            title: "Study timeslot",
            start: new Date(2024, 2, 18, 14, 0),
            duration: { minutes: 60 },
            days: WEEKDAYS,
            color: "orange",
            timeslot: true,
        },
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
                const result = scheduleFlexibleEvent({
                    id: prev.length,
                    title: eventName,
                    resizable: true,
                    allDay: allDay ?? false,
                    start,
                    duration,
                });
                if (!result.scheduleSuccess) {
                    return prev;
                }
                if (draggedTask !== null) {
                    resetDraggedTask();
                }
                return [...prev, result.event];
            });
        },
        [draggedTask, setEvents, scheduleFlexibleEvent],
    );

    return (
        <div className="h-full flex-auto">
            <DnDCalendar
                eventPropGetter={(ev) => {
                    //@ts-ignore
                    const event: Event | TimeSlot = ev;
                    return {
                        style: {
                            backgroundColor: event.color ?? "blue",
                        },
                    };
                }}
                localizer={localizer}
                backgroundEvents={timeSlots}
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
                timeslots={4}
                step={15}
                scrollToTime={new Date()}
            />
        </div>
    );
}

//todo prompt is not supported by tauri, have an actual pop up
function newEventPopup() {
    return prompt("Event name:", "Unnamed Event");
}

export default MyCalendar;
