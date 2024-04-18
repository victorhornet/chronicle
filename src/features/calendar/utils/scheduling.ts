import {
    checkConstraints,
    durationBetween,
    findCollisions,
    subDurs,
    Event,
    EventNoId,
} from '@/utils';

export function scheduleFlexibleEvent(
    event: EventNoId | Event,
    events: Event[]
) {
    const NEWID = 'NEWID';
    let rescheduledEvent: Event = {
        ...event,
        id: 'id' in event ? event.id : NEWID,
    };
    findCollisions(rescheduledEvent, events).forEach((col) => {
        switch (col?.colType) {
            case 'startCollides':
                rescheduledEvent = {
                    ...rescheduledEvent,
                    start: col.otherEnd,
                    duration: subDurs(
                        rescheduledEvent.duration,
                        durationBetween(rescheduledEvent.start, col.otherEnd)
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
}
