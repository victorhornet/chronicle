import { Event, getEnd } from '@/utils';

type EventInfoProps = {
    event: Event | null;
};
export function EventInfo({ event }: EventInfoProps) {
    if (event === null) {
        return <h1>Select an event</h1>;
    }
    const event_end = getEnd(event);
    return (
        <>
            <h1>{event.title}</h1>
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
        </>
    );
}
