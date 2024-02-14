
import { NextApiRequest, NextApiResponse } from "next";

import { parse } from 'node-html-parser';
import { db } from "../../utils/db";
import getSession from "utils/getSession";
// import getPage from "utils/getPage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req)

  //@ts-ignore
  return res.send(await getPage({ session, type: "subjects" }))

}
