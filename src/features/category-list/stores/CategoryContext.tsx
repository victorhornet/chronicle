import { db } from '@/features/category-list';
import {
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import { DatabaseContext } from '@/features/database-connection';

type CategoryColorMap = { [key: string]: string };
export const CategoryContext = createContext<CategoryColorMap>({});

export function CategoryProvider({ children }: PropsWithChildren) {
    const [value, setValue] = useState<CategoryColorMap>({});
    const conn = useContext(DatabaseContext);
    useEffect(() => {
        console.log('Category Provider mounted');

        const fetchData = async () => {
            if (conn !== null) {
                const categories = (await db.readCategories(conn)).reduce(
                    (acc: CategoryColorMap, { title, color }) => {
                        acc[title] = color;
                        return acc;
                    },
                    {}
                );
                setValue(categories);
            }
        };
        fetchData();
    }, [conn]);
    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
}
