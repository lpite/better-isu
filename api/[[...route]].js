// export const config = {
//   api: {
//     bodyParser: false,
//   },

// };

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const decoder = new TextDecoder("windows-1251");
const htmlParser = require("node-html-parser");
const { parse } = htmlParser;

async function getFacultets() {
  const formDataWithKey = new FormData();
  formDataWithKey.append("schedAppKey", process.env.ISU_API_KEY || "");

  const facultets = await fetch(
    "https://isu1.khmnu.edu.ua/isu/pub/api/v1/getFaculties.php",
    {
      method: "POST",
      body: formDataWithKey,
    },
  )
    .then((res) => res.json())
    .catch((_) => []);

  return facultets;
}

async function getGroups(facultyId, course) {
  const formDataWithKey = new FormData();
  formDataWithKey.append("schedAppKey", process.env.ISU_API_KEY || "");

  formDataWithKey.append("course", course);
  formDataWithKey.append("facultyId", facultyId.toString());
  const groups = await fetch(
    "https://isu1.khmnu.edu.ua/isu/pub/api/v1/getGroups.php",
    {
      method: "POST",
      body: formDataWithKey,
    },
  )
    .then((res) => res.json())
    .catch((_) => []);
  return groups;
}
/**
 * @description currSem від початку навчання тобто не просто 1, 2
 */

async function getGroup(groupId, facultyId, course) {
  const groups = await getGroups(facultyId, course);

  const group = groups.find((gr) => gr.groupId === groupId);

  if (!group) {
    const groups = await getGroups(
      facultyId,
      (parseInt(course) - 1).toString(),
    );
    const group = groups.find((el) => el.groupId === groupId);
    return group;
  }

  return group;
}

async function getScheduleByApi(groupId, currSem, faculty_id, course) {
  const formDataWithKey = new FormData();
  formDataWithKey.append("schedAppKey", process.env.ISU_API_KEY || "");

  let studYear = new Date().getFullYear();
  let currentSemester = "1";

  /* про що я думав це цирк ??*/
  if (currSem % 2 === 0) {
    studYear--;
    currentSemester = "2";
  }

  formDataWithKey.append("groupId", groupId.toString());
  formDataWithKey.append("studyYear", studYear.toString());
  formDataWithKey.append("semester", currentSemester);
  const schedule = await fetch(
    "https://isu1.khmnu.edu.ua/isu/pub/api/v1/getScheduleForGroup.php",
    {
      method: "POST",
      body: formDataWithKey,
    },
  )
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
      return [];
    });

  const pairTypes = ["full", "up", "bottom"];
  const studyTypes = ["", "лекц.", "пр.", "лаб."];

  return schedule.map((el) => {
    return {
      day: el.dayName,
      number: el.pairNum,
      type: pairTypes[el.weekId],
      name: `${studyTypes[el.studyTypeId]} ${el.subjectName}`,
      auditory: el.audName,
      subjectName: el.subjectName,
      teacherShortName: el.teacherShortName,
      teacherFullName: el.teacherFullName,
      // Вказує на те чи є цей предмет вибірковим.
      isSelectable: el.isSubGroup === "Y" ? true : false,
      dateFrom: el.dateFrom,
      dateTo: el.dateTo,
    };
  });
}

async function getTypeOfWeek() {
  const text = await fetch("https://isu1.khmnu.edu.ua/isu/dbsupport/logon.php")
    .then((r) => r.arrayBuffer())
    .then((r) => decoder.decode(r));
  const html = parse(text);
  const typeOfWeek = html
    .querySelector(".logo-time")
    ?.textContent?.split(".")[1]
    ?.trim();

  let response = "up";
  if (typeOfWeek === "Знаменник") {
    response = "bottom";
  }
  return response;
}

function generateDaysList(weekType, schedule) {
  if (!weekType) {
    return [];
  }
  const correctWeekDays = [6, 0, 1, 2, 3, 4, 5];
  const scheduleTimes = {
    1: "8:00 - 9:20",
    2: "9:35 - 10:55",
    3: "11:10 - 12:30",
    4: "13:00 - 14:20",
    5: "14:35 - 15:55",
    6: "16:10 - 17:30",
    7: "17:45 - 19:05",
    8: "19:20 - 20:40",
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
  const list = [];
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
    const types = { up: "Чисельник", bottom: "Знаменник" };

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

module.exports = async (req, res) => {
  const { url, facultyName, course, groupName } = req.query;
  if (req.url.includes("/group")) {
    const facultets = await getFacultets();

    const faculty = facultets.find((el) => el.facultyName === facultyName);
    if (!faculty) {
      console.error("no faculty");

      return res.send(JSON.stringify({}));
    }
    const groups = await getGroups(faculty.facultyId, course);
    const group = groups.find((el) => el.groupName === groupName);
    group.currSem = group.currSem;
    return res.send(JSON.stringify(group));
  }

  if (req.url.includes("/schedule")) {
    const facultets = await getFacultets();

    const faculty = facultets.find((el) => el.facultyName === facultyName);
    if (!faculty) {
      console.error("no faculty");

      return res.send(JSON.stringify([]));
    }
    const groups = await getGroups(faculty.facultyId, course);
    const group = groups.find((el) => el.groupName === groupName);

    const schedule = await getScheduleByApi(
      group?.groupId,
      group?.currSem,
      faculty.facultyId,
      course,
    );
    const currentWeekType = await getTypeOfWeek();
    return res.send(generateDaysList(currentWeekType, schedule));
  }

  const auth = req.headers["authorization"];
  const response = fetch(url, {
    method: req.method,
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? new URLSearchParams(req.body).toString()
        : undefined,
    headers: {
      Cookie: auth ? "PHPSESSID=" + auth : "",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "include",
    redirect: "manual",
  });
  (await response).headers.forEach((v, k) => {
    if (k === "set-cookie") {
      res.setHeader(
        k,
        v.replace("PHPSESSID", "isu_cookie").replace("HttpOnly", ""),
      );
    }
    //c.header(k, v.replace("PHPSESSID", "isu_cookie").replace("HttpOnly", ""));
  });
  const json = await (
    await response
  )
    .clone()
    .json()
    .catch((err) => {
      return null;
    });

  if (json) {
    return res.send(json);
  }

  const responseText = await response
    .then((r) => r.arrayBuffer())
    .then((buf) => decoder.decode(buf))
    .catch((err) => {
      console.error(err);
      return "";
    });
  res.send(responseText);
};
