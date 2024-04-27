import { NextApiRequest, NextApiResponse } from "next";

export default function LogoutRoute(_: NextApiRequest, res: NextApiResponse) {
	res.setHeader("Set-Cookie", `session=;Max-Age=0;HttpOnly`);
	res.redirect("/login")
}