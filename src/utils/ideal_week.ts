const daysOfWeek = [0, 1, 2, 3, 4, 5, 6] as const;
type DayOfWeek = (typeof daysOfWeek)[number];
type EventCategories = string[];
type TimeBlocks = Map<DayOfWeek, Map<string, number>>;
type DayCategories = Map<string, Set<DayOfWeek>>;

function createDayCategory(categories: DayCategories, category: string) {
    if (categories.get(category) === undefined) {
        categories.set(category, new Set());
    }
}

function deleteDayCategoryt(categories: DayCategories, category: string) {
    categories.delete(category);
}

function getAvailableDays(categories: DayCategories): Set<DayOfWeek> {
    const days = new Set(daysOfWeek);
    for (const cat in categories) {
        categories.get(cat)?.forEach((day) => {
            days.delete(day);
        });
    }
    return days;
}

function assignDayOfWeekToCategory(
    categories: DayCategories,
    category: string,
    day: DayOfWeek
) {
    if (!getAvailableDays(categories).has(day)) {
        return;
    }
    createDayCategory(categories, category);
    categories.get(category)?.add(day);
}

function removeDayOfWeekFromCategory(
    categories: DayCategories,
    category: string,
    day: DayOfWeek
) {
    if (getAvailableDays(categories).has(day)) {
        return;
    }
    if (categories.get(category) === undefined) {
        return;
    }
    categories.get(category)?.delete(day);
}

function getAvailableTimeOnDay(timeBlocks: TimeBlocks, day: DayOfWeek): number {
    let res = 24 * 60;
    const dayBlocks = timeBlocks.get(day);
    if (dayBlocks === undefined) {
        return res;
    }
    dayBlocks.forEach((block) => {
        res -= block;
    });
    return res;
}

function getAvailableTimeInWeek(
    timeBlocks: TimeBlocks
): Map<DayOfWeek, number> {
    const res = new Map();
    daysOfWeek.forEach((day) => {
        res.set(day, getAvailableTimeOnDay(timeBlocks, day));
    });
    return res;
}
