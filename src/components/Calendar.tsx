import React from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const events = [
    {
        title: "Big Meeting",
        start: new Date(2024, 2, 7, 8), // Note: JavaScript months are 0-based
        end: new Date(2024, 2, 7, 8, 30),
    },
    {
        title: "Vacation",
        start: new Date(2024, 2, 5, 22),
        end: new Date(2024, 2, 5, 23, 59, 59),
    },
    {
        title: "Bacation",
        start: new Date(2024, 2, 5, 18),
        end: new Date(2024, 2, 5, 23, 59, 59),
    },
    {
        title: "Pacation",
        start: new Date(2024, 2, 5, 20),
        end: new Date(2024, 2, 5, 23, 59, 59),
    },
    // Add more events here
];

const MyCalendar: React.FC = () => (
    <div className="h-full flex-auto">
        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
        />
    </div>
);

export default MyCalendar;
