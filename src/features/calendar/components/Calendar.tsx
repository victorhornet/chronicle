import { useCallback, useContext, useState } from 'react';
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
    Event,
    getEnd,
    TimeSlot,
    WORKDAYS,
    WEEKDAYS,
    DEFAULT_CATEGORY,
} from '@/utils';
import enUS from 'date-fns/locale/en-US';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import '../styles/Calendar.css';
import { EventInfo, UpdateEventFormInputs } from './EventInfo';
import { useForm } from 'react-hook-form';
import { CategoryContext } from '@/features/category-list/stores/CategoryContext';
import { InfoPanel } from '@/components/Layout';
import { scheduleFlexibleEvent } from '../utils/scheduling';
import { DatabaseContext } from '@/features/database-connection';
import { eventStorage } from '@/features/event-storage';

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

export type CreateEventArgs = {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    categoryOverride?: string;
};

export type MyCalendarProps = {
    events: Event[];
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
};
export function Calendar({ events, setEvents }: MyCalendarProps) {
    const categories = useContext(CategoryContext);
    const conn = useContext(DatabaseContext);
    const updateEventForm = useForm<UpdateEventFormInputs>();
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [timeSlots] = useState<TimeSlot[]>([
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

    const deleteEvent = useCallback(
        (event: Event) => {
            setEvents((prev) => prev.filter((ev) => ev.id !== event.id));
            if (conn !== null) {
                eventStorage.delete_event(conn, event);
            }
        },
        [conn, setEvents]
    );
    const updateEvent = useCallback(
        (event: Event) => {
            setEvents((prev) => [
                ...prev.filter((ev) => ev.id !== event.id),
                event,
            ]);
            if (conn !== null) {
                eventStorage.update_event(conn, event);
            }
        },
        [conn, setEvents]
    );

    const onDelete = useCallback(() => {
        if (selectedEvent !== null) {
            deleteEvent(selectedEvent);
        }
        setSelectedEvent(null);
    }, [selectedEvent, setSelectedEvent, deleteEvent]);

    const rescheduleExistingEvent = useCallback(
        ({ event, start, end, allDay }: RescheduleEventArgs) => {
            const duration = intervalToDuration(interval(start, end));
            const result = scheduleFlexibleEvent(
                {
                    ...event,
                    allDay,
                    start,
                    duration,
                },
                events
            );
            console.log(events);

            if (!result.scheduleSuccess) {
                return;
            }
            updateEvent(result.event);
            setSelectedEvent(result.event);
        },
        [events, updateEvent, setSelectedEvent]
    );

    const createEvent = useCallback(
        async ({
            title,
            start,
            end,
            allDay,
            categoryOverride,
        }: CreateEventArgs) => {
            const duration = intervalToDuration(interval(start, end));
            const result = scheduleFlexibleEvent(
                {
                    title,
                    resizable: true,
                    allDay: allDay ?? false,
                    start,
                    duration,
                    categoryOverride,
                },
                events
            );
            if (!result.scheduleSuccess || conn === null) {
                return false;
            }
            const queryResult = await eventStorage.create_event(
                conn,
                result.event
            );
            console.log(queryResult);
            const newEventId = queryResult.id.toString();
            const newEvent = { ...result.event, id: newEventId };
            setEvents((prev) => [...prev, newEvent]);
            setSelectedEvent(newEvent);
            return true;
        },
        [events, conn, setEvents, setSelectedEvent]
    );
    const cloneEvent = useCallback(
        async (event: Event) => {
            if (conn !== null) {
                const newEvent = await eventStorage.create_event(conn, event);
                setEvents((prev) => [...prev, newEvent]);
                setSelectedEvent(newEvent);
            }
        },
        [conn, setEvents, setSelectedEvent]
    );
    const cloneSelectedEvent = useCallback(() => {
        if (selectedEvent !== null) {
            cloneEvent(selectedEvent);
        }
    }, [selectedEvent, cloneEvent]);

    const onSelectSlots = useCallback(
        (ev: CreateEventArgs) => {
            createEvent(ev);
            updateEventForm.setFocus('title');
        },
        [createEvent, updateEventForm]
    );

    const handleKeybinds = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            console.log(event.key);
            if (event.key === 'Backspace') {
                onDelete();
            }
            if (event.key.toLowerCase() === 'd') {
                cloneSelectedEvent();
            }
        },
        [onDelete, cloneSelectedEvent]
    );

    return (
        <>
            <div
                className="flex-1 flex-grow"
                onKeyDown={handleKeybinds}
                tabIndex={0}
            >
                <DnDCalendar
                    eventPropGetter={(ev) => {
                        //@ts-ignore
                        const event: Event = ev;
                        const category =
                            event.categoryOverride ?? DEFAULT_CATEGORY;
                        return {
                            style: {
                                backgroundColor:
                                    categories[category] ??
                                    categories[DEFAULT_CATEGORY],
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
                    onEventDrop={rescheduleExistingEvent}
                    //@ts-ignore
                    onEventResize={rescheduleExistingEvent}
                    //@ts-ignore
                    onSelectSlot={onSelectSlots}
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
            <InfoPanel>
                <EventInfo
                    event={selectedEvent}
                    updateEvent={updateEvent}
                    useFormReturn={updateEventForm}
                />
            </InfoPanel>
        </>
    );
}
