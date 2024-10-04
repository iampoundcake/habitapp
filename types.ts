export interface Habit {
    id: number;
    name: string;
    description: string;
    frequency: 'daily' | 'every-other-day' | 'weekly' | 'custom';
    customDays?: number[]; // 0 for Sunday, 1 for Monday, etc.
    startDate?: string;
    endDate?: string; // ISO date string
    color: string;
    completedDates: string[];
}