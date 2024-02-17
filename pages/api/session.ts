import { NextApiRequest, NextApiResponse } from "next";
import getSession from "utils/getSession";

export default async function SessionRoute(req: NextApiRequest, res: NextApiResponse) {
	const session = await getSession(req);
	if (session.data) {
		delete session.data.isu_cookie
	}
	res.send(session)
}