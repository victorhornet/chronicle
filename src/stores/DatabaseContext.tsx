import { db } from '@/features/event-storage';
import Database from '@tauri-apps/plugin-sql';
import { PropsWithChildren, createContext, useEffect, useState } from 'react';

export const DatabaseContext = createContext<Database | null>(null);

export function DatabaseProvider({ children }: PropsWithChildren) {
    const [value, setValue] = useState<Database | null>(null);
    useEffect(() => {
        console.log('DB Provider mounted');

        const fetchConnection = async () => {
            const conn = await db.connect();
            setValue(conn);
        };
        fetchConnection();
    }, []);
    return (
        <DatabaseContext.Provider value={value}>
            {children}
        </DatabaseContext.Provider>
    );
}
