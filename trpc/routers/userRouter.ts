import { procedure, router } from "trpc/trpc";
import { getProfilePage, getSubjectsPage } from "utils/getPage";

export const userRouter = router({
	profile: procedure.query(({ ctx }) => {
		// @ts-ignore

		return getProfilePage(ctx.session)
	}),
	subjects: procedure.query(({ ctx }) => {
		//@ts-ignore

		return getSubjectsPage(ctx.session)
		// return getPage({ session: ctx.session, type: "subjects" })
	})
})