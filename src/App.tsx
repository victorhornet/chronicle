import { useState } from "react";
import "./styles/App.css";
import {
    GridPos,
    MINUTES_PER_SLOT,
    PERCENTAGE_PER_SLOT,
    TOTAL_SLOTS_PER_DAY,
    dateAdd,
    dateSub,
    dateToSlot,
    days,
    hours,
    isToday,
    minutes,
    removeTime,
    toDays,
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

    const extraColumns = 4;

    const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dayOffsets = Array.from(Array(displayedDays).keys());
    const dateCols = dayOffsets.map((dayOffset) =>
        dateAdd(weekStart, days(dayOffset)),
    );
    const gridTemplateColumns = `repeat(${displayedDays}, 1fr)`;

    const computeGridPos = (datetime: Date) => {
        return {
            col: toDays(
                removeTime(datetime).getTime() -
                    removeTime(weekStart).getTime(),
            ),
            row: dateToSlot(datetime),
        };
    };
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
            <div
                className="grid flex-grow flex-row items-center overflow-scroll bg-slate-200"
                style={{
                    gridTemplateColumns,
                    gridTemplateRows: `[heading-start] min-content [heading-end] 1fr [body-end]`,
                }}
            >
                <CalendarHeader
                    dayOffsets={dayOffsets}
                    dateCols={dateCols}
                    daysOfWeek={daysOfWeek}
                />
                <CalendarBody
                    dayOffsets={dayOffsets}
                    dateCols={dateCols}
                    daysOfWeek={daysOfWeek}
                    gridTemplateColumns={gridTemplateColumns}
                    computeGridPos={computeGridPos}
                />
            </div>
        </div>
    );
}

type CalendarChildProps = {
    dayOffsets: number[];
    dateCols: Date[];
    daysOfWeek: string[];
};
function CalendarHeader({
    dayOffsets,
    dateCols,
    daysOfWeek,
}: CalendarChildProps) {
    return (
        <>
            {dayOffsets.map((dayOffset) => {
                const date = dateCols[dayOffset];
                const day = date.getDay();
                const bold = isToday(date) ? "font-bold" : "";
                const dayOfWeek = daysOfWeek[day];
                return (
                    <h1
                        key={dayOffset + date.toString()}
                        className={[
                            "row-start-[heading-start] row-end-[heading-end]",
                            bold,
                        ].join(" ")}
                        style={{
                            gridColumnStart: dayOffset + 1,
                            gridColumnEnd: dayOffset + 2,
                        }}
                    >
                        {dayOfWeek} {date.getDate()}
                    </h1>
                );
            })}
        </>
    );
}

type CalendarBodyProps = CalendarChildProps & {
    gridTemplateColumns: string;
    computeGridPos: (datetime: Date) => GridPos;
};
function CalendarBody({
    dayOffsets,
    gridTemplateColumns,
    computeGridPos,
}: CalendarBodyProps) {
    const displayedDays = dayOffsets.length;
    const randOffset = hours(1);
    const events = [
        {
            name: "EVENT",
            start: dateSub(new Date(2024, 2, 7, 10, 0), randOffset),
            duration: minutes(30),
        },
        {
            name: "EVENT",
            start: dateSub(new Date(2024, 2, 5, 10, 0), randOffset),
            duration: hours(5),
        },
        {
            name: "EVENT",
            start: dateSub(new Date(2024, 2, 4, 10, 0), randOffset),
            duration: hours(10),
        },
        {
            name: "EVENT",
            start: dateSub(new Date(2024, 2, 8, 10, 0), randOffset),
            duration: hours(4),
        },
        {
            name: "EVENT",
            start: dateSub(new Date(2024, 2, 9, 10, 0), randOffset),
            duration: hours(15),
        },
    ];
    return (
        <div
            className="row-start-[heading-end] row-end-[body-end] grid h-full overflow-hidden"
            style={{
                gridColumnStart: 1,
                gridColumnEnd: displayedDays + 1,
                gridTemplateColumns,
                gridTemplateRows: `repeat(${TOTAL_SLOTS_PER_DAY}, ${PERCENTAGE_PER_SLOT}%)`,
            }}
        >
            {events.map((event) => (
                <Event
                    key={event.name + event.start + event.duration}
                    name={event.name}
                    start={event.start}
                    duration={event.duration}
                    computeGridPos={computeGridPos}
                />
            ))}
        </div>
    );
}

type EventProps = {
    name: string;
    start: Date;
    duration: number;
    computeGridPos: (datetime: Date) => GridPos;
};
function Event({ name, start, duration, computeGridPos }: EventProps) {
    const startSlot = computeGridPos(start);
    const end = dateAdd(start, Math.max(duration, minutes(MINUTES_PER_SLOT)));
    const endSlot = computeGridPos(end);
    const slots = Array.from(Array(endSlot.col + 1 - startSlot.col).keys())
        .map((key) => key + startSlot.col)
        .map((col) => {
            const gridRowStart = col === startSlot.col ? startSlot.row : 1;
            const gridRowEnd =
                col === endSlot.col ? endSlot.row : TOTAL_SLOTS_PER_DAY + 1;
            console.log(`col ${col}, rows ${gridRowStart}:${gridRowEnd}`);
            if (gridRowStart === gridRowEnd) {
                return;
            }
            return (
                <div
                    className="h-full w-full overflow-hidden rounded-md border-2 border-slate-100 bg-white"
                    draggable={true}
                    style={{
                        gridColumnStart: col,
                        gridColumnEnd: col,
                        gridRowStart,
                        gridRowEnd,
                    }}
                >
                    <h1>{name}</h1>
                    {/* <p>{start.toTimeString()}</p> */}
                </div>
            );
        });
    return <>{slots}</>;
}

export default App;
