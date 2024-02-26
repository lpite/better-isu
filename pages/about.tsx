import MobileNavigation from "@/components/mobile-navigation";
import Link from "next/link";


export default function AboutPage() {
	return (
		<main className="flex flex-col items-center py-4 px-4 pb-14">
			<h2 className="text-3xl mb-6">Технології</h2>
			<div className="bg-slate-900 w-full py-6 px-4 rounded-xl flex flex-col mb-4">
				<span className="text-2xl mb-2">Typescript</span>
				<span className="text-lg">Як javascript тільки краще</span>
			</div>
			<div className="bg-slate-900 w-full py-6 px-4 rounded-xl flex flex-col mb-4">
				<span className="text-2xl mb-2">nextjs</span>
				<span className="text-lg">Вебфреймворк оснований на react</span>
			</div>
			<div className="bg-slate-900 w-full py-6 px-4 rounded-xl flex flex-col mb-4">
				<span className="text-2xl mb-2">nextjs</span>
				<span className="text-lg">CSS фреймворк для простої стилізації</span>
			</div>
			<div className="bg-slate-900 w-full py-6 px-4 rounded-xl flex flex-col mb-4">
				<span className="text-2xl mb-2">PostgreSQL</span>
				<span className="text-lg">Швиденька та потужна база даних</span>
			</div>
			<div className="bg-slate-900 w-full py-6 px-4 rounded-xl flex flex-col mb-4">
				<span className="text-2xl mb-2">trpc</span>
				<span className="text-lg">Зберігає типізацію між бекендом та фронтендом</span>
			</div>
			<div className="bg-slate-900 w-full py-6 px-4 rounded-xl flex flex-col mb-4">
				<Link href="https://github.com/lpite/better-isu">
					<a className="text-2xl mb-2">GitHub</a>
				</Link>
			</div>
			<MobileNavigation />
		</main>
	)
}