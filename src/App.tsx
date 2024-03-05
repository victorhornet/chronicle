import { useState } from "react";
import "./styles/App.css";
import {
    PIXELS_PER_SLOT,
    TOTAL_SLOTS,
    dateAdd,
    dateSub,
    dateToSlot,
    days,
    hours,
    isToday,
    toSlots,
} from "./utils";

function App() {
    return (
        <div className="h-screen">
            <div className="flex h-full flex-row">
                <TaskList />
                <Calendar />
            </div>
        </div>
    );
}

function TaskList() {
    let tasks: string[] = ["test", "best", "jest"];
    return (
        <div className="w-1/6 flex-initial bg-slate-500">
            <h1 className="text-4xl font-extrabold">Tasks</h1>
            <ul>
                {tasks.map((task) => (
                    <li
                        className="border-3 m-2 rounded-md border-slate-300 bg-slate-100 px-2 py-1 hover:border-pink-500"
                        draggable={true}
                        key={task}
                    >
                        {task}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Calendar() {
    const now = new Date();
    const [displayedDays, setDisplayedDays] = useState(7);
    const [mondayFirst, setMondayFirst] = useState(false);
    const baseStartWeek =
        displayedDays === 7
            ? dateSub(now, days(now.getDay()) - days(Number(mondayFirst)))
            : dateSub(now, days(Math.floor((displayedDays - 1) / 2)));
    const [weekStart, setWeekStart] = useState(baseStartWeek);
    const incWeekStart = () => setWeekStart(dateAdd(weekStart, days(1)));
    const decWeekStart = () => setWeekStart(dateSub(weekStart, days(1)));
    const todayWeekStart = () => setWeekStart(now);

    const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    return (
        <div className="flex flex-auto flex-col bg-slate-400">
            {/* <h1>Calendar</h1> */}
            <div className="flex flex-row">
                <button className="flex-auto" onClick={decWeekStart}>
                    {"<"}
                </button>
                <button
                    className="flex-auto"
                    onClick={() => setDisplayedDays(7)}
                >
                    Week
                </button>
                <button
                    className="flex-auto"
                    onClick={() => setDisplayedDays(3)}
                >
                    3 Days
                </button>
                <button
                    className="flex-auto"
                    onClick={() => setDisplayedDays(1)}
                >
                    Day
                </button>
                <button className="flex-auto" onClick={todayWeekStart}>
                    Today
                </button>
                <button
                    className="flex-auto"
                    onClick={() => setMondayFirst(!mondayFirst)}
                >
                    Set {mondayFirst ? "Sunday" : "Monday"} First
                </button>
                <button className="flex-auto" onClick={incWeekStart}>
                    {">"}
                </button>
            </div>
            <div className="flex flex-grow flex-row overflow-scroll">
                {Array.from(Array(displayedDays).keys()).map((dayOffset) => {
                    const date = dateAdd(weekStart, days(dayOffset));
                    return (
                        <Column
                            key={date.getTime()}
                            date={date}
                            daysOfWeek={daysOfWeek}
                        />
                    );
                })}
            </div>
        </div>
    );
}

type ColumnProps = { date: Date; daysOfWeek: string[] };
function Column({ date, daysOfWeek }: ColumnProps) {
    const day = date.getDay();
    const bold = isToday(date) ? "font-bold" : "";
    const dayOfWeek = daysOfWeek[day];
    const randOffset = hours(Math.floor(Math.random() * 10));
    return (
        <div className="flex h-full flex-auto flex-col border-x-2 bg-slate-100 p-1">
            <p className={[bold].join(" ")}>
                {dayOfWeek} {date.getDate()}
            </p>
            <EventCol
                events={[
                    {
                        name: "EVENT",
                        start: dateSub(date, randOffset),
                        duration: hours(Math.floor(Math.random() * 5) + 1),
                    },
                ]}
            />
        </div>
    );
}

type EventColProps = { events: EventProps[] };
function EventCol({ events }: EventColProps) {
    const percentage = Math.floor(10000 / TOTAL_SLOTS) / 100;
    return (
        <div
            className="grid flex-grow grid-cols-1 items-center bg-blue-300 p-1"
            style={{
                gridTemplateRows: `repeat(${TOTAL_SLOTS}, ${percentage}%`,
            }}
        >
            {events.map((event) => (
                <Event
                    // key={event}
                    name={event.name}
                    start={event.start}
                    duration={event.duration}
                    key={event.name + event.start + event.duration}
                />
            ))}
        </div>
    );
}

type EventProps = { name: string; start: Date; duration: number };
function Event({ name, start, duration }: EventProps) {
    const startSlot = dateToSlot(start);
    const durationSlots = toSlots(duration);
    const endSlot = startSlot + durationSlots;
    console.log("Duration: ", durationSlots);

    console.log(startSlot, endSlot);

    return (
        <div
            className="col-span-1 h-full w-full overflow-hidden bg-white"
            draggable={true}
            style={{ gridRowStart: startSlot, gridRowEnd: endSlot }}
            // style={{ height: percentage }}
        >
            <h1>{name}</h1>
            <p>{start.toTimeString()}</p>
        </div>
    );
}

export { Calendar, TaskList, EventCol as DayCol, Event };
export default App;
