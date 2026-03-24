import { API_URL } from "@/config";
import { parse } from "node-html-parser";

export async function getProfilePage(token: string) {
  const [eduplansPage, profileHtml] = await Promise.all([
    fetch(
      `${API_URL}/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php`,
      {
        headers: {
          Authorization: token,
        },
      },
    )
      .then((r) => r.text())
      .then((p) => parse(p)),
    fetch(
      `${API_URL}/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/personnel.php`,
      {
        headers: {
          Authorization: token,
        },
      },
    )
      .then((r) => r.text())
      .then((p) => parse(p)),
  ]);
  const eduplansCells = eduplansPage.querySelectorAll("#TabCell");
  const profileCells =
    profileHtml?.querySelector("#MainTab")?.querySelectorAll("#TabCell") || [];

  const profile = {
    name: eduplansCells[2].textContent,
    surname: eduplansCells[1].textContent,
    fathersName: eduplansCells[3].textContent,
    recordNumber: eduplansCells[9].textContent,
    faculty: eduplansCells[4].textContent,
    speciality: eduplansCells[5].textContent,
    group: eduplansCells[7].textContent,
    course: eduplansCells[10].textContent,
    birthDate: profileCells[profileCells?.length - 1].textContent,
  };

  return profile;
}
