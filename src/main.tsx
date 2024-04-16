import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/styles/styles.css';
import '@/styles/output.css';
import { DatabaseProvider } from '@/stores/DatabaseContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <DatabaseProvider>
            <App />
        </DatabaseProvider>
    </React.StrictMode>
);
