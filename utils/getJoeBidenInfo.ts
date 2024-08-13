export function getJoeBidenInfo() {
  const session = {
    data: {
      id: 0,
      user_id: 0,
      created_at: new Date(),
      credentials: "",
      isu_cookie: "",
      session_id: "joe_biden_session",
    },
  };

  const profile = {
    name: "Джо",
    surname: "Байден",
    birthDate: "20.11.1942",
    recordNumber: "0",
    group: "група",
    faculty: "факультет",
    course: "курс",
    speciality: "якась спеціальність",
  };

  const subjects = [
    { name: "Еристика", link: "link" },
    { name: "Міжнародне право", link: "link" },
    { name: "Психологія конфлікту", link: "link" },
    { name: "Іноземна мова за професійним спрямуванням", link: "link" },
    { name: "Культурологія", link: "link" },
    { name: "Філософія абсурду", link: "link" },
  ];

  const schedule = [
    {
      name: "лекц. Еристика 1-101 Викладач О.О.",
      day: "Пн",
      number: "1",
      type: "full",
    },
    {
      name: "лекц. Психологія конфлікту 3-303 Викладач О.О.",
      day: "Пн",
      number: "2",
      type: "full",
    },
    {
      name: "лекц. Філософія абсурду 1-103 Викладач О.О.",
      day: "Вт",
      number: "2",
      type: "full",
    },
    {
      name: "пр. Іноземна мова за професійним спрямуванням 1-103 Викладач О.О.",
      day: "Ср",
      number: "5",
      type: "full",
    },
    {
      name: "лекц. Філософія абсурду 1-103 Викладач О.О.",
      day: "Ср",
      number: "5",
      type: "full",
    },
    {
      name: "лекц. Культурологія 1-103 Викладач О.О.",
      day: "Чт",
      number: "6",
      type: "full",
    },
  ];

  const journal = {
    journalName: "Назва журналу",
    months: [
      {
        name: "Вересень",
        grades: [
          {
            DAYNUM: "1",
            CONTROLSHORTNAME: "Пр",
            GRADE: "5",
            LFP: "",
            MONTHSTR: "Вересень",
            RECORDBOOK: "0",
          },
          {
            DAYNUM: "3",
            CONTROLSHORTNAME: "Пр",
            GRADE: "5",
            LFP: "",
            MONTHSTR: "Вересень",
            RECORDBOOK: "0",
          },
        ],
      },
    ],
  };

  const rating = Array(10)
    .fill("")
    .map((_, i) => {
      return {
        number: i.toString(),
        name: "Імʼя",
        surname: "Прізвище",
        rating: (5 - i * 0.1).toString(),
        group: "група",
        type: "тип",
      };
    });

  return {
    session,
    profile,
    subjects,
    schedule,
    journal,
    rating,
  };
}
