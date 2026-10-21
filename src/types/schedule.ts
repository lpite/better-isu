/**
 * Тип тижня розкладу: чисельник або знаменник.
 */
export type WeekType = "up" | "bottom";

/**
 * Один предмет у розкладі дня.
 */
export type ScheduleItem = {
  /** "# 1 8:00 - 9:20" */
  number: string;
  /** "Теорія і проєктування ... (лабораторна)" */
  name: string;
  /** "Теорія і проєктування ..." */
  subjectName: string;
  /** "1-108" */
  auditory: string;
  teacherShortName: string;
  teacherFullName: string;
  dateFrom: string;
  dateTo: string;
};

/**
 * День розкладу, який показує карусель.
 */
export type ScheduleDay = {
  /** Число місяця, наприклад "23" */
  date: string;
  /** "Жовтня" */
  month: string;
  /** "Пт" */
  weekDay: string;
  /** "Чисельник" | "Знаменник" */
  type: string;
  /** Опис заміни дня, якщо день замінений */
  replacement?: string | null;
  list: ScheduleItem[];
};
