interface GetJournal {
  token?: string;
  key: string;
  recordNumber?: string;
  journalName: string;
}

interface Grade {
  ID: string;
  ROWID: string;
  STID: string;
  PID: string;
  LFP: string;
  RECORDBOOK: string;
  INFO: string;
  GROUPID: string;
  GROUPNAME: string;
  COLID: string;
  CONTROLID: string;
  CONTROLNAME: string;
  CONTROLSHORTNAME: string;
  SORTORDER: string;
  REQUIRED: string;
  WEIGHT: string;
  MINCOUNT: string;
  COUNTPERPOINT: string;
  STUDYDATE: string;
  YEARNUM: string;
  MONTHNUM: string;
  MONTHSTR: string;
  DAYNUM: string;
  GRADEROWID: string;
  GRADECOLID: string;
  GRADE: string;
  PREVS: string;
  RECTIME: string;
  UID: string;
}

interface Control {
  ID: number;
  NAME: string;
  WEIGHT: string;
  REQUIRED: string;
  MINCOUNT: number;
  COUNTPERPOINT: string;
}

export async function getJournal({
  token,
  key,
  recordNumber,
  journalName,
}: GetJournal) {
  if (!token) {
    console.error("NO AUTH TOKEN");
    return null;
  }

  const journalPage = await fetch(
    "/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/journals.php" +
      encodeURIComponent("?key=" + key),
    {
      headers: {
        Authorization: token,
        //      "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  )
    .then((r) => r.text())
    .catch((err) => {
      console.error(err);
      return null;
    });

  if (!journalPage) {
    console.error("empty journal page!");
    return null;
  }
  const journalId =
    (journalPage.match(/journalId:\s*'([^']+)'/) || [])[1] || null;
  const groupId = (journalPage.match(/groupId:\s*'([^']+)'/) || [])[1] || null;

  if (!journalId) {
    console.error("cant find journal id on journal page!");
    return null;
  }

  const journalControls = await fetch(
    "/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/jrncontrols.php",
    {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `jrnId=${journalId}&page=1&start=0&limit=25`,
    },
  ).then((r) => r.json()) as Control[]

  const journalGrades = (await fetch(
    "/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/jrngrades.php",
    {
      headers: {
        Authorization: token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: `grp=${groupId}&jrn=${journalId}&page=1&start=0&limit=25`,
    },
  ).then((res) => res.json())) as Grade[];

  return {
    grades: journalGrades.filter((el) => el.RECORDBOOK.trim() === recordNumber),
    controls: journalControls,
    journalName: journalName,
  };
}
