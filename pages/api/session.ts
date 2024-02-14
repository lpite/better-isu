import { NextApiRequest, NextApiResponse } from "next";
import getSession from "utils/getSession";

export default async function SessionRoute(req: NextApiRequest, res: NextApiResponse) {
	const s = await getSession(req);
	res.send(s)
}