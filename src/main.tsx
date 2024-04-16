import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/styles/styles.css';
import '@/styles/output.css';
import { DatabaseProvider } from '@/stores/DatabaseContext';
import { CategoryProvider } from './stores/CategoryContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <DatabaseProvider>
            <CategoryProvider>
                <App />
            </CategoryProvider>
        </DatabaseProvider>
    </React.StrictMode>
);
