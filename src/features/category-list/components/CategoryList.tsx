import { useContext } from 'react';
import { CategoryContext } from '@/features/category-list/stores/CategoryContext';
import { CategoryItem } from './CategoryItem';

export type CategoryListProps = {};
export function CategoryList({}: CategoryListProps) {
    const categories = useContext(CategoryContext);

    return (
        <>
            <h1 className="text-xl font-extrabold">Categories</h1>
            <div className="flex flex-col p-3 text-center">
                {Object.entries(categories).map(([title, color]) => {
                    return (
                        <CategoryItem key={title} category={{ title, color }} />
                    );
                })}
            </div>
        </>
    );
}
