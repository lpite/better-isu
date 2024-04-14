import MobileNavigation from "@/components/mobile-navigation";
import Link from "next/link";


export default function AboutPage() {
	return (
		<main className="flex flex-col items-center py-4 px-4 pb-14">
			<h2 className="text-2xl mb-6">Технології</h2>
			<div className="bg-slate-900 w-full py-6 px-4 rounded-xl flex flex-col mb-3">
				<span className="text-xl mb-2">Typescript</span>
				<span className="text-md">Як javascript тільки краще</span>
			</div>
			<div className="bg-slate-900 w-full py-6 px-4 rounded-xl flex flex-col mb-3">
				<span className="text-xl mb-2">nextjs</span>
				<span className="text-md">Вебфреймворк оснований на react</span>
			</div>
			<div className="bg-slate-900 w-full py-6 px-4 rounded-xl flex flex-col mb-3">
				<span className="text-xl mb-2">tailwindcss</span>
				<span className="text-md">CSS фреймворк для простої стилізації</span>
			</div>
			<div className="bg-slate-900 w-full py-6 px-4 rounded-xl flex flex-col mb-3">
				<span className="text-xl mb-2">PostgreSQL</span>
				<span className="text-md">Швиденька та потужна база даних</span>
			</div>
			<div className="bg-slate-900 w-full py-6 px-4 rounded-xl flex flex-col mb-3">
				<span className="text-xl mb-2">trpc</span>
				<span className="text-md">Зберігає типізацію між бекендом та фронтендом</span>
			</div>
			<div className="border-2 w-full py-6 px-4 rounded-xl flex flex-col mb-3 wiggle_bg">
				<Link href="https://github.com/lpite/better-isu">
					<a className="text-xl">GitHub репозиторій</a>
				</Link>
			</div>
			<MobileNavigation />
		</main>
	)
}