import { procedure, router } from "trpc/trpc";
import { getProfilePage, getSubjectsPage } from "utils/getPage";

export const userRouter = router({
	profile: procedure.query(({ ctx }) => {
		// @ts-ignore

		return getProfilePage(ctx.session)
	}),
	subjects: procedure.query(({ ctx }) => {

		ctx.res.setHeader("Cache-Control", "public,max-age=30000, stale-while-revalidate=86400")
		//@ts-ignore

		return getSubjectsPage(ctx.session)
	})
})