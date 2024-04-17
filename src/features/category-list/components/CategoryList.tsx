import { useContext } from 'react';
import { SchemaCategory } from '../types/schema';
import { CategoryContext } from '@/features/category-list/stores/CategoryContext';

export type CategoryListProps = {};
export function CategoryList({}: CategoryListProps) {
    const categories = useContext(CategoryContext);

    return (
        <>
            <h1 className="text-xl font-extrabold">Categories</h1>
            {Object.entries(categories).map(([title, color]) => {
                return <CategoryItem key={title} category={{ title, color }} />;
            })}
        </>
    );
}

type CategoryItemProps = { category: SchemaCategory };
function CategoryItem({ category: { title, color } }: CategoryItemProps) {
    return <p style={{ color }}>{title}</p>;
}
