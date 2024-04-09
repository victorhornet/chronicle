import { useCallback, useMemo, useState } from 'react';
import { Calendar } from './Calendar';
import { TaskList } from '@/features/tasks';
import { analyzeWeek, Event } from '@/utils';
import { v4 as uuidv4 } from 'uuid';

export function CalAndTasks() {
    const [draggedTask, setDraggedTask] = useState<string | null>(null);
    const [events, setEvents] = useState<Event[]>([
        {
            id: uuidv4(),
            title: 'Pacation',
            start: new Date(2024, 2, 17, 20),
            duration: { hours: 3, minutes: 59 },
            allDay: false,
            resizable: true,
        },
        {
            id: uuidv4(),
            title: '💤 Sleep',
            start: new Date(2024, 2, 18, 22),
            duration: { hours: 8 },
            allDay: false,
            resizable: true,
            schedulingConstraints: {
                durationConstraint: {
                    minDuration: { hours: 7 },
                    maxDuration: { hours: 9 },
                },
            },
            categoryOverride: 'Sleep',
            color: 'grey',
        },
        {
            id: uuidv4(),
            title: 'Vacation',
            start: new Date(2024, 2, 19, 22),
            duration: { hours: 1, minutes: 59 },
            allDay: false,
            resizable: true,
            categoryOverride: 'Recovery',
            color: 'pink',
        },

        {
            id: uuidv4(),
            title: 'Start between 07:00 and 10:00\nEnd between 12:00 and 13:00',
            start: new Date(2024, 2, 20, 8), // Note: JavaScript months are 0-based
            duration: { hours: 1, minutes: 15 },
            allDay: false,
            resizable: true,
            schedulingConstraints: {
                startTime: {
                    minStart: new Date(0, 0, 0, 7, 0),
                    maxStart: new Date(0, 0, 0, 10, 0),
                },
                endTime: {
                    minEnd: new Date(0, 0, 0, 12, 0),
                    maxEnd: new Date(0, 0, 0, 13, 0),
                },
            },
        },
        {
            id: uuidv4(),
            title: 'Only monday, wednesday, friday',
            start: new Date(2024, 2, 21, 18),
            duration: { hours: 8 },
            allDay: false,
            resizable: true,
            schedulingConstraints: {
                allowedDays: { days: [1, 3, 5] },
            },
        },
        {
            id: uuidv4(),
            title: 'Breakfast',
            start: new Date(2024, 2, 22, 9, 30),
            duration: { minutes: 30 },
            allDay: false,
            resizable: true,
            schedulingConstraints: {
                startTime: {
                    minStart: new Date(0, 0, 0, 9, 15),
                    maxStart: new Date(0, 0, 0, 10, 0),
                },
                durationConstraint: {
                    minDuration: { minutes: 15 },
                    maxDuration: { minutes: 45 },
                },
            },
        },
        // Add more events here
    ]);
    const handleDragStart = (task: string) => {
        console.log(task);
        setDraggedTask(task);
    };
    const resetDraggedTask = useCallback(() => {
        setDraggedTask(null);
    }, [setDraggedTask]);

    const analytics = useMemo(() => analyzeWeek(new Date(), events), [events]);

    return (
        <>
            <div className="flex h-full flex-row">
                <div className="flex w-1/6 flex-initial flex-col bg-slate-200">
                    <TaskList handleDragStart={handleDragStart} />
                    <Analytics analytics={analytics} />
                </div>
                <Calendar
                    draggedTask={draggedTask}
                    resetDraggedTask={resetDraggedTask}
                    events={events}
                    setEvents={setEvents}
                />
            </div>
        </>
    );
}

function Analytics({
    analytics,
}: {
    analytics: {
        totalMinutes: number;
        categoryMinutes: {
            [key: string]: number;
        };
        categoryPercentages: [string, number][];
    };
}) {
    return (
        <div className="flex-grow">
            <h1>Analytics</h1>
            <table className="w-full align-middle">
                <thead>
                    <tr>
                        <th>Category</th>
                        <td>Hours</td>
                        <td>% of week</td>
                    </tr>
                </thead>
                <tbody>
                    {analytics.categoryPercentages
                        .sort(([, a_perc], [, b_perc]) => b_perc - a_perc)
                        .map(([category, percentage]) => {
                            return (
                                <tr key={category}>
                                    <th>{category}</th>
                                    <td>
                                        {Math.floor(
                                            analytics.categoryMinutes[
                                                category
                                            ] / 60
                                        )}
                                        h
                                    </td>
                                    <td>{Math.floor(percentage)}%</td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
}
