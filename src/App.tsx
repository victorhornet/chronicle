import { useEffect } from 'react';
import { CalAndTasks } from './features/calendar';
import { db } from '@/features/event-storage';
import './styles/App.css';

function App() {
    useEffect(() => {
        (async () => {
            const conn = await db.connect();
            const events = await db.read_all_events(conn);
            console.log(events);
        })();
    }, []);
    return (
        <div className="h-screen">
            <CalAndTasks />
        </div>
    );
}

export default App;
