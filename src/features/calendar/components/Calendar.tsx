import { useCallback, useState } from 'react';
import { Calendar as RBCalendar, dateFnsLocalizer } from 'react-big-calendar';
import {
    format,
    parse,
    startOfWeek,
    getDay,
    interval,
    intervalToDuration,
} from 'date-fns';
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
} from '@/utils';
import enUS from 'date-fns/locale/en-US';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import '../styles/Calendar.css';
import { EventInfo } from './EventInfo';
import { NewEventForm } from './NewEventForm';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(RBCalendar);

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
export function Calendar({
    draggedTask,
    resetDraggedTask,
    events,
    setEvents,
}: MyCalendarProps) {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
        {
            id: 0,
            title: 'Work timeslot',
            start: new Date(2024, 2, 18, 7, 0),
            duration: { hours: 2, minutes: 30 },
            days: WORKDAYS,
            color: 'red',
            timeslot: true,
        },
        {
            id: 1,
            title: 'Breakfast timeslot',
            start: new Date(2024, 2, 18, 9, 30),
            duration: { minutes: 30 },
            days: WEEKDAYS,
            color: 'blue',
            timeslot: true,
        },
        {
            id: 2,
            title: 'Work timeslot',
            start: new Date(2024, 2, 18, 10, 0),
            duration: { hours: 3 },
            days: WORKDAYS,
            color: 'red',
            timeslot: true,
        },
        {
            id: 3,
            title: 'Lunch timeslot',
            start: new Date(2024, 2, 18, 13, 0),
            duration: { minutes: 30 },
            days: WEEKDAYS,
            color: 'blue',
            timeslot: true,
        },
        {
            id: 4,
            title: 'Walk timeslot',
            start: new Date(2024, 2, 18, 13, 30),
            duration: { minutes: 30 },
            days: WEEKDAYS,
            color: 'green',
            timeslot: true,
        },
        {
            id: 5,
            title: 'Study timeslot',
            start: new Date(2024, 2, 18, 14, 0),
            duration: { minutes: 60 },
            days: WEEKDAYS,
            color: 'orange',
            timeslot: true,
        },
    ]);

    const checkCollisions = useCallback(
        (event: Event): (Collision | null)[] => findCollisions(event, events),
        [events]
    );
    const deleteEvent = useCallback(
        (event: Event) => {
            setEvents((prev) => prev.filter((ev) => ev.id !== event.id));
        },
        [setEvents]
    );
    const updateEvent = useCallback(
        (event: Event) => {
            setEvents((prev) => [
                ...prev.filter((ev) => ev.id !== event.id),
                event,
            ]);
        },
        [setEvents]
    );
    const onDelete = useCallback(() => {
        setSelectedEvent((prev) => {
            if (prev !== null) {
                deleteEvent(prev);
            }
            return null;
        });
    }, [setSelectedEvent, deleteEvent]);

    const handleKeybinds = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            console.log(event.key);
            if (event.key === 'Backspace') {
                onDelete();
            }
        },
        [onDelete]
    );

    const scheduleFlexibleEvent = useCallback(
        (event: Event) => {
            let rescheduledEvent = { ...event };
            checkCollisions(event).forEach((col) => {
                switch (col?.colType) {
                    case 'startCollides':
                        rescheduledEvent = {
                            ...rescheduledEvent,
                            start: col.otherEnd,
                            duration: subDurs(
                                rescheduledEvent.duration,
                                durationBetween(
                                    rescheduledEvent.start,
                                    col.otherEnd
                                )
                            ),
                        };
                        break;
                    case 'endCollides':
                        rescheduledEvent = {
                            ...rescheduledEvent,
                            duration: durationBetween(
                                rescheduledEvent.start,
                                col.otherStart
                            ),
                        };
                        break;
                    default:
                        break;
                }
            });

            return checkConstraints(rescheduledEvent);
        },
        [events, checkCollisions]
    );

    const manuallyScheduleEvent = useCallback(
        ({ event, start, end, allDay }: RescheduleEventArgs) => {
            const duration = intervalToDuration(interval(start, end));
            const result = scheduleFlexibleEvent({
                ...event,
                allDay,
                start,
                duration,
            });
            if (!result.scheduleSuccess) {
                return;
            }
            updateEvent(result.event);
            setSelectedEvent(result.event);
        },
        [updateEvent, scheduleFlexibleEvent, setSelectedEvent]
    );

    const createEvent = useCallback(
        ({ start, end, allDay }: RescheduleEventArgs) => {
            setEvents((prev) => {
                const eventName = draggedTask ?? newEventPopup();
                if (eventName === null || eventName === '') {
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
                setSelectedEvent(result.event);
                return [...prev, result.event];
            });
        },
        [draggedTask, setEvents, scheduleFlexibleEvent, setSelectedEvent]
    );

    return (
        <div
            className="flex h-full flex-grow flex-row"
            onKeyDown={handleKeybinds}
            tabIndex={0}
        >
            <div className="flex-1 flex-grow">
                <DnDCalendar
                    eventPropGetter={(ev) => {
                        //@ts-ignore
                        const event: Event | TimeSlot = ev;
                        return {
                            style: {
                                backgroundColor: event.color ?? 'blue',
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
                    //@ts-ignore
                    onSelectEvent={(ev) => setSelectedEvent(ev)}
                />
            </div>
            <div className="w-1/6 flex-initial">
                <NewEventForm
                    onSubmit={(name, start, end, allDay) => {
                        console.log(name, start, end, allDay);
                    }}
                />
                <EventInfo event={selectedEvent} />
            </div>
        </div>
    );
}

//todo prompt is not supported by tauri, have an actual pop up
function newEventPopup() {
    return prompt('Event name:', 'Unnamed Event');
}
