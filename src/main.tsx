import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/styles/styles.css';
import '@/styles/output.css';
import DatabaseContext from '@/stores/DatabaseContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <DatabaseContext.Provider value={null /*await db.connect()*/}>
            <App />
        </DatabaseContext.Provider>
    </React.StrictMode>
);
