export function generateDaysList(
  weekType: "up" | "bottom",
  schedule: Record<string, string>[],
) {
  if (!weekType) {
    return [];
  }
  const correctWeekDays = [6, 0, 1, 2, 3, 4, 5];
  const scheduleTimes: Record<string, string> = {
    "1": "8:00 - 9:20",
    "2": "9:35 - 10:55",
    "3": "11:10 - 12:30",
    "4": "13:00 - 14:20",
    "5": "14:35 - 15:55",
    "6": "16:10 - 17:30",
    "7": "17:45 - 19:05",
    "8": "19:20 - 20:40",
  };
  const listOfDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  const listOfMonth = [
    "Січня",
    "Лютого",
    "Березня",
    "Квітня",
    "Травня",
    "Червня",
    "Липня",
    "Серпня",
    "Вересня",
    "Жовтня",
    "Листопада",
    "Грудня",
  ];

  // Список замін для пʼятниці
  const listForFriday = [
    { date: "06.09", type: "up", day: "Пн" },
    { date: "13.09", type: "up", day: "Вт" },
    { date: "20.09", type: "up", day: "Ср" },
    { date: "27.09", type: "up", day: "Чт" },
    { date: "04.10", type: "bottom", day: "Пн" },
    { date: "11.10", type: "bottom", day: "Вт" },
    { date: "18.10", type: "bottom", day: "Ср" },
    { date: "25.10", type: "bottom", day: "Чт" },
    { date: "01.11", type: "up", day: "Пн" },
    { date: "08.11", type: "up", day: "Вт" },
    { date: "15.11", type: "up", day: "Ср" },
    { date: "22.11", type: "up", day: "Чт" },
    { date: "29.11", type: "bottom", day: "Пн" },
  ];

  const date = new Date();
  const currentWeekDay = correctWeekDays[date.getDay()];
  // ЯКИЙ ЦЕ ЖАХ.
  const list: {
    date: string;
    weekDay: string;
    month: string;
    type: "Чисельник" | "Знаменник";
    list: any[];
  }[] = [];
  let wt = weekType;

  for (let i = -currentWeekDay; i < 14 - currentWeekDay; i++) {
    const currentDate = new Date(date.getTime() + i * 24 * 60 * 60 * 1000);

    if (currentDate.getDay() === 1 && i !== -currentWeekDay) {
      // wt = weekType;
      if (wt === "up") {
        wt = "bottom";
      } else {
        wt = "up";
      }
    }
    const types = { up: "Чисельник", bottom: "Знаменник" } as const;

    list.push({
      date: `${currentDate.getDate()}`,
      month: `${listOfMonth[currentDate.getMonth()]}`,
      weekDay: listOfDays[correctWeekDays[currentDate.getDay()]],
      type: types[wt],
      list: schedule
        ?.filter((el) => {
          if (currentDate.getDay() === 5) {
            // заміна пʼятниці
            const scheduleForFriday = listForFriday.find((el) => {
              const [d, m] = el.date.split(".");
              if (
                currentDate.getMonth() + 1 === parseInt(m) &&
                currentDate.getDate() === parseInt(d)
              ) {
                return true;
              }
              return false;
            });
            if (
              el.day === scheduleForFriday?.day &&
              (el.type === scheduleForFriday?.type || el.type === "full")
            ) {
              return true;
            }
            return false;
          }

          if (
            el.day === listOfDays[correctWeekDays[currentDate.getDay()]] &&
            (el.type === wt || el.type === "full")
          ) {
            return true;
          }
          return false;
        })
        .map((el) => {
          return {
            number: `# ${el.number} ${scheduleTimes[el.number]}`,
            name: el.name,
            auditory: el.auditory,
            teacherShortName: el.teacherShortName,
            teacherFullName: el.teacherFullName,
          };
        }),
    });
  }

  return list;
}
