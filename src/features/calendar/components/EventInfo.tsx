import { Event, getEnd } from '@/utils';
import { useCallback, useEffect } from 'react';
import { CreateEventArgs } from '@/features/calendar';
import { useForm } from 'react-hook-form';

type EventInfoProps = {
    event: Event | null;
    updateEvent: (event: Event) => void;
};
export function EventInfo({ event, updateEvent }: EventInfoProps) {
    return (
        <div className="p-3 text-center">
            {event === null ? (
                <EmptyEventInfo />
            ) : (
                <UpdateEventForm event={event} updateEvent={updateEvent} />
            )}
        </div>
    );
}

function EmptyEventInfo() {
    return <h1>Select an event</h1>;
}

type UpdateEventFormProps = {
    event: Event;
    updateEvent: (event: Event) => void;
};
function UpdateEventForm({ event, updateEvent }: UpdateEventFormProps) {
    const saveFormChanges = useCallback(
        ({ title }: CreateEventArgs) => {
            if (event === null) {
                return;
            }
            const ev = {
                title,
            };
            console.log(ev);
            updateEvent({
                ...event,
                title,
            });
        },
        [event, updateEvent]
    );

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CreateEventArgs>();

    useEffect(() => {
        if (event !== null) {
            setValue('title', event.title);
            setValue('start', event.start);
            setValue('end', getEnd(event));
            setValue('allDay', event.allDay ?? false);
        }
    }, [event]);

    const event_end = getEnd(event);
    return (
        <form onSubmit={handleSubmit(saveFormChanges)} className="inline-block">
            <input
                placeholder="Event Title"
                defaultValue={event.title ?? 'Untitled Event'}
                {...register('title')}
            />
            <p>
                {event.start.getHours()}:{event.start.getMinutes()}
                {' -> '}
                {event_end.getHours()}:{event_end.getMinutes()} (
                {event.duration.hours !== undefined
                    ? `${event.duration.hours}h `
                    : ''}
                {event.duration.minutes !== undefined
                    ? `${event.duration.minutes}min`
                    : ''}
                )
            </p>
            {errors.start && errors.end && <span>This field is required</span>}
            <input type="submit" value="Update" />
        </form>
    );
}
