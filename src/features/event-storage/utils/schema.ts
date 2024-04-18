import { DEFAULT_CATEGORY, Event as TimeBlockEvent } from '@/utils';
import { SchemaEvent } from '../types/schema';
import { format } from 'date-fns';

export function event_to_schema(ev: TimeBlockEvent): SchemaEvent {
    return {
        id: ev.id,
        summary: ev.title,
        start: format(ev.start, 'yyyy-MM-dd HH:mm:ss'),
        duration: `${ev.duration.hours ?? '00'}:${ev.duration.minutes ?? '00'}:${ev.duration.seconds ?? '00'}`,
        category: ev.categoryOverride ?? DEFAULT_CATEGORY,
    };
}

export function event_from_schema(ev: SchemaEvent): TimeBlockEvent {
    const hms = ev.duration.split(':');
    const duration = {
        hours: parseInt(hms[0]),
        minutes: parseInt(hms[1]),
        seconds: parseInt(hms[2]),
    };
    return {
        id: ev.id,
        title: ev.summary,
        start: new Date(ev.start),
        duration,
        resizable: true,
        categoryOverride: ev.category ?? DEFAULT_CATEGORY,
    };
}
