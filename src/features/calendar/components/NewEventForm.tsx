import { useState } from 'react';

type NewEventFormProps = {
    onSubmit: (title: string, start: Date, end: Date, allDay: boolean) => void;
};
export function NewEventForm({ onSubmit }: NewEventFormProps) {
    const [title, setTitle] = useState<string>('');
    const [start, setStart] = useState<Date>(new Date());
    const [end, setEnd] = useState<Date>(new Date());
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                onSubmit(title, start, end, false);
            }}
        >
            <input
                type="text"
                placeholder="Event Title"
                value={title}
                onChange={(ev) => setTitle(ev.target.value)}
            />
            <input
                type="datetime-local"
                value={start.toISOString().slice(0, -1)}
                onChange={(ev) => setStart(new Date(ev.target.value))}
            />
            <input
                type="datetime-local"
                value={end.toISOString().slice(0, -1)}
                onChange={(ev) => setEnd(new Date(ev.target.value))}
            />
            <input type="submit" />
        </form>
    );
}
