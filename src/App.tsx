import "./styles/App.css";
import Calendar from "./components/Calendar";

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
        <div className="w-1/6 flex-initial bg-slate-200">
            <h1 className="text-xl font-extrabold">Tasks</h1>
            <ul>
                {tasks.map((task) => (
                    <li
                        className="border-3 m-2 rounded-md border-slate-100 bg-slate-50 px-2 py-1 hover:border-pink-500"
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

export default App;
