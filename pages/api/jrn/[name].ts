import { NextApiRequest, NextApiResponse } from "next";
import getSession from "utils/getSession";

export default async function JournalData(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req);
  res.setHeader("Content-Type", "text/html");
  if (!session.data || session.error) {
    return res.send({});
  }

  if (req.query.name === "jrncontrols.php") {
    const controlsData = await fetch(
      `https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/jrncontrols.php`,
      {
        method: "POST",
        body: `jrnId=${req.body.jrnId}&page=1&start=0&limit=25`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `PHPSESSID=${session.data.isu_cookie}`,
        },
      },
    ).then((res) => res.text());
    res.send(controlsData);
  } else if (req.query.name === "jrngrades.php") {
    const gradesData = await fetch(
      `https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/jrngrades.php`,
      {
        method: "POST",
        body: `grp=${req.body.grp}&jrn=${req.body.jrn}&page=1&start=0&limit=25`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `PHPSESSID=${session.data.isu_cookie}`,
        },
      },
    ).then((res) => res.text());

    res.send(gradesData);
  } else {
    const summaryData = await fetch(
      `https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/grpsummary.php`,
      {
        method: "POST",
        body: `grp=${req.body.grp}&subj=${req.body.subj}&dep=${req.body.dep}&year=${req.body.year}&sem=${req.body.sem}&page=1&start=0&limit=25`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `PHPSESSID=${session.data.isu_cookie}`,
        },
      },
    ).then((res) => res.text());

    res.send(summaryData);
  }
}
