export type TaskListProps = { handleDragStart: (task: string) => void };
export function TaskList({ handleDragStart }: TaskListProps) {
    let tasks: string[] = ['test', 'best', 'jest'];
    return (
        <>
            <h1 className="text-xl font-extrabold">Tasks</h1>
            <ul>
                {tasks.map((task) => (
                    <li
                        className="border-3 m-2 rounded-md border-slate-100 bg-slate-50 px-2 py-1 hover:border-pink-500"
                        draggable={true}
                        onDragStart={() => handleDragStart(task)}
                        key={task}
                    >
                        {task}
                    </li>
                ))}
            </ul>
        </>
    );
}
