export interface Habit {
    id: string;
    name: string;
    description: string;
    frequency: 'daily' | 'every-other-day' | 'weekly' | 'custom';
    color: string;
    customDays?: number[];
    completedDates: string[]; // Make sure this is always initialized, even if empty
}