import Database from '@tauri-apps/plugin-sql';
import { createContext } from 'react';

export default createContext<Database | null>(null);
