import { useState } from "react";
import "./styles/App.css";

function App() {



    return (
        <div className="h-screen">
            <div className="flex flex-row h-full">
                <TaskList />
                <Calendar />
            </div>
        </div>
    );
}

function TaskList() {
    let tasks: string[] = ["test", "best", "jest"];
    return (
        <div className="flex-initial w-1/6 bg-slate-500">
            <h1 className="text-4xl font-extrabold">Tasks</h1>
            <ul>
                {tasks.map((task) => <li className="m-2 px-2 py-1 bg-slate-100 border-3 border-slate-300 hover:border-pink-500 rounded-md" draggable={true} key={task}>{task}</li>)}
            </ul>
        </div>
    );
}

function Calendar() {
    const now = new Date();
    const [displayedDays, setDisplayedDays] = useState(7);
    const [mondayFirst, setMondayFirst] = useState(false);
    const baseStartWeek = displayedDays === 7 ? dateSub(now, days(now.getDay()) - days(Number(mondayFirst))) : dateSub(now, days(Math.floor((displayedDays - 1) / 2)));
    const [weekStart, setWeekStart] = useState(baseStartWeek);
    const incWeekStart = () => setWeekStart(dateAdd(weekStart, days(1)));
    const decWeekStart = () => setWeekStart(dateSub(weekStart, days(1)));
    const todayWeekStart = () => setWeekStart(now);

    const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    return (
        <div className="flex-auto bg-slate-400 flex flex-col">
            {/* <h1>Calendar</h1> */}
            <div className="flex flex-row">
                <button className="flex-auto" onClick={decWeekStart}>{"<"}</button>
                <button className="flex-auto" onClick={() => setDisplayedDays(7)}>Week</button>
                <button className="flex-auto" onClick={() => setDisplayedDays(3)}>3 Days</button>
                <button className="flex-auto" onClick={() => setDisplayedDays(1)}>Day</button>
                <button className="flex-auto" onClick={todayWeekStart}>Today</button>
                <button className="flex-auto" onClick={() => setMondayFirst(!mondayFirst)}>Set {mondayFirst ? "Sunday" : "Monday"} First</button>
                <button className="flex-auto" onClick={incWeekStart}>{">"}</button>
            </div>
            <div className="flex flex-row flex-grow">
                {Array.from(Array(displayedDays).keys()).map((dayOffset) => {
                    return (
                        <Column date={dateAdd(weekStart, days(dayOffset))} daysOfWeek={daysOfWeek} />
                    );
                })}
            </div>
        </div >
    );
}

function Column({ date, daysOfWeek }: { date: Date; daysOfWeek: string[]; }) {
    const day = date.getDay();
    const bold = isToday(date) ? "font-bold" : "";
    const dayOfWeek = daysOfWeek[day];
    return (
        <div className="flex-auto bg-slate-100 h-full border-x-2 p-1 flex flex-col">
            <p key={date.getTime()} className={[bold].join(" ")}>{dayOfWeek} {date.getDate()}</p>
            <div className="flex-grow flex flex-col bg-blue-300" ></div>
        </div>
    );

}


/// UTILS
function dateEquals(date1: Date, date2: Date) {
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
}

function isToday(date: Date) {
    return dateEquals(date, new Date());
}

/**
 * Adds the given number of milliseconds to the given date and returns a new date.
 * @param date the date to add to
 * @param millis the duration to add
 * @returns the new date resulting from the addition
 */
function dateAdd(date: Date, millis: number) {
    return new Date(date.getTime() + millis);
}

/**
 * Subtracts the given number of milliseconds from the given date and returns a new date.
 * @param date the date to subtract from
 * @param millis the duration to subtract
 * @returns the new date resulting from the subtraction
 */
function dateSub(date: Date, millis: number) {
    return new Date(date.getTime() - millis);
}


/**
 * Returns a duration from the given number of months
 * @param months number of months
 * @returns millisecond equivalent of months
 */
function months(months: number) {
    return days(months * 30);
}

/**
 * Returns a duration from the given number of days
 * @param days number of days
 * @returns millisecond equivalent of days
 */
function days(days: number) {
    return hours(days * 24);
}

/**
 * Returns a duration from the given number of hours
 * @param hours number of hours
 * @returns millisecond equivalent of hours
 */
function hours(hours: number) {
    return minutes(hours * 60);
}

/**
 * Returns a duration from the given number of minutes
 * @param minutes number of minutes
 * @returns millisecond equivalent of minutes
 */
function minutes(minutes: number) {
    return seconds(minutes * 60);
}

/**
 * Returns a duration from the given number of seconds
 * @param seconds number of seconds
 * @returns millisecond equivalent of seconds
 */
function seconds(seconds: number) {
    return millis(seconds * 1000);
}

/**
 * Returns a duration from the given number of milliseconds. This is a no-op, declared for clarity.
 * @param millis number of milliseconds
 * @returns the given number of milliseconds
 */
function millis(millis: number) {
    return millis;
}



/// EXPORTS
export { Calendar, TaskList };
export default App;
