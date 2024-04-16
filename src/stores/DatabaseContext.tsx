import { db } from '@/features/event-storage';
import Database from '@tauri-apps/plugin-sql';
import { PropsWithChildren, createContext, useEffect, useState } from 'react';

export const DatabaseContext = createContext<Database | null>(null);

export function DatabaseProvider({ children }: PropsWithChildren) {
    const [connection, setConnection] = useState<Database | null>(null);
    useEffect(() => {
        console.log('DB Provider mounted');

        const fetchConnection = async () => {
            const conn = await db.connect();
            setConnection(conn);
        };
        fetchConnection();
        return () => {
            connection?.close();
        };
    }, []);
    return (
        <DatabaseContext.Provider value={connection}>
            {children}
        </DatabaseContext.Provider>
    );
}
