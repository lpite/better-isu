
import { NextApiRequest, NextApiResponse } from "next";

import getSession from "utils/getSession";
import { getSubjectsPage } from "utils/getPage";
// import getPage from "utils/getPage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req)
  if (session.data) {
    
    return res.send(await getSubjectsPage(session.data))
  }

}
