export interface DayEntry {
  id: string;
  date: string;
  names: string[];
  location: string;
  workHours: {
    start: string;
    end: string;
    total: number;
  };
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthData {
  year: number;
  month: number;
  entries: Record<string, DayEntry>;
}
