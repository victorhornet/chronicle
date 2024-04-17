import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Calendar } from './Calendar';
import { analyzeWeek, Event } from '@/utils';

import { eventStorage } from '@/features/event-storage';
import { DatabaseContext } from '@/features/database-connection';
import {
    formatDuration,
    intervalToDuration,
    minutesToMilliseconds,
} from 'date-fns';
import { CategoryContext, CategoryList } from '@/features/category-list';
import { Body, Layout, Sidebar } from '@/components/Layout';

export function TimeBlocker() {
    const [events, setEvents] = useState<Event[]>([]);
    const conn = useContext(DatabaseContext);
    useEffect(() => {
        (async () => {
            if (conn === null) {
                return;
            }
            const events = await eventStorage.load_events(conn);
            setEvents(events);
        })();
    }, [conn]);

    return (
        <Layout>
            <Sidebar>
                <CategoryList />
                <Analytics events={events} />
            </Sidebar>
            <Body>
                <Calendar events={events} setEvents={setEvents} />
            </Body>
        </Layout>
    );
}

function Analytics({ events }: { events: Event[] }) {
    const categories = useContext(CategoryContext);
    const getColor = useCallback(
        (category: string) => categories[category] ?? categories['Default'],
        [categories]
    );
    const analytics = useMemo(() => analyzeWeek(new Date(), events), [events]);
    const unscheduledTime = intervalToDuration({
        start: 0,
        end: minutesToMilliseconds(
            Object.entries(analytics.categoryMinutes).reduce(
                (acc, [, minutes]) => acc - minutes,
                analytics.totalMinutes
            )
        ),
    });
    return (
        <div className="flex-grow">
            <h1 className="text-xl font-extrabold">Analytics</h1>
            <h1>
                {formatDuration(unscheduledTime, {
                    format: ['weeks', 'days', 'hours'],
                })}{' '}
                unscheduled
            </h1>
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
                                    <th
                                        style={{
                                            color: getColor(category),
                                        }}
                                    >
                                        {category}
                                    </th>
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
