import { useCallback, useState } from "react";
import Calendar from "./Calendar";
import TaskList from "./TaskList";

export default function CalAndTasks() {
    const [draggedTask, setDraggedTask] = useState<string | null>(null);
    const handleDragStart = (task: string) => {
        console.log(task);
        setDraggedTask(task);
    };
    const resetDraggedTask = useCallback(() => {
        setDraggedTask(null);
    }, [setDraggedTask]);
    return (
        <>
            <div className="flex h-full flex-row">
                <TaskList handleDragStart={handleDragStart} />
                <Calendar
                    draggedTask={draggedTask}
                    resetDraggedTask={resetDraggedTask}
                />
            </div>
        </>
    );
}
