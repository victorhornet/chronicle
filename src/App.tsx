import { useState } from "react";
import "./styles/App.css";

function App() {
    const [days, setDays] = useState(7);
    const [startOnMonday, setStartOnMonday] = useState(true);
    let tasks: string[] = ["test", "best", "jest"];
    const now = new Date();
    const day = now.getDay();
    const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dayOfWeek = daysOfWeek[day];
    const boldDay = (dayNum: number) => dayNum;
    return (
        <div className="h-screen">
            <div className="flex flex-row h-full">
                <div className="flex-initial w-1/6 bg-slate-500">
                    <h1 className="text-4xl font-extrabold">Tasks</h1>
                    <ul>
                        {tasks.map((task) => <li className="m-2 px-2 py-1 bg-slate-100 border-3 border-slate-300 hover:border-pink-500 rounded-md" draggable={true} key={task}>{task}</li>)}
                    </ul>
                </div>
                <div className="flex-auto bg-slate-400">
                    <h1>Calendar</h1>
                    <h2>Date: {now.getDate()}/{now.getMonth()}/{now.getFullYear()}</h2>
                    <div>
                        {Array.from(Array(days).keys()).map((k) => <p>{daysOfWeek[k]}</p>)}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default App;
