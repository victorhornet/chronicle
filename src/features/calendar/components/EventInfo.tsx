import { DEFAULT_CATEGORY, Event, getEnd } from '@/utils';
import { useCallback, useEffect } from 'react';
import { CreateEventArgs } from '@/features/calendar';
import { UseFormReturn } from 'react-hook-form';

type EventInfoProps = {
    event: Event | null;
    updateEvent: (event: Event) => void;
    useFormReturn: UseFormReturn<UpdateEventFormInputs>;
};
export function EventInfo({
    event,
    updateEvent,
    useFormReturn,
}: EventInfoProps) {
    return (
        <div className="p-3 text-center">
            {event === null ? (
                <EmptyEventInfo />
            ) : (
                <UpdateEventForm
                    event={event}
                    updateEvent={updateEvent}
                    useFormReturn={useFormReturn}
                />
            )}
        </div>
    );
}

function EmptyEventInfo() {
    return <h1>Select an event</h1>;
}

export type UpdateEventFormInputs = CreateEventArgs & {
    category: string;
};
type UpdateEventFormProps = {
    event: Event;
    updateEvent: (event: Event) => void;
    useFormReturn: UseFormReturn<UpdateEventFormInputs>;
};
function UpdateEventForm({
    event,
    updateEvent,
    useFormReturn,
}: UpdateEventFormProps) {
    const saveFormChanges = useCallback(
        ({ title, category }: UpdateEventFormInputs) => {
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
                categoryOverride: category,
            });
        },
        [event, updateEvent]
    );

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useFormReturn;

    useEffect(() => {
        if (event !== null) {
            setValue('title', event.title);
            setValue('start', event.start);
            setValue('end', getEnd(event));
            setValue('allDay', event.allDay ?? false);
            setValue('category', event.categoryOverride ?? DEFAULT_CATEGORY);
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
            <p>
                Category: <input {...register('category')} />
            </p>
            {errors.start && errors.end && <span>This field is required</span>}
            <input hidden type="submit" value="Update" />
        </form>
    );
}
