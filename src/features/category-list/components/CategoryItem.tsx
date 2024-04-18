import { SchemaCategory } from '../types/schema';

type CategoryItemProps = { category: SchemaCategory };
export function CategoryItem({
    category: { title, color },
}: CategoryItemProps) {
    return (
        <div className="flex flex-row">
            <label className="swap">
                <input hidden type="checkbox" />
                <p className="swap-on font-bold" style={{ color }}>
                    {title}
                </p>
                <p className="swap-off" style={{ color: 'gray' }}>
                    {title}
                </p>
            </label>
        </div>
    );
}
