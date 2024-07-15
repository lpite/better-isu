import MobileNavigation from "@/components/mobile-navigation";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="flex flex-col items-center py-4 px-4 pb-14">
      <div className="dark:bg-black border-2 w-full py-5 px-4 rounded-xl flex flex-col mb-3 wiggle_bg">
        <Link href="https://github.com/lpite/better-isu">
          <a className="text-xl" target="_blank">
            GitHub репозиторій
          </a>
        </Link>
      </div>
      <div className="dark:bg-black border-2 w-full py-5 px-4 rounded-xl flex flex-col mb-3 bubbles_bg">
        <Link href="https://t.me/lpite">
          <a className="text-xl" target="_blank">
            Знайшли помилку?
          </a>
        </Link>
      </div>
      <h2 className="text-2xl mt-6 mb-2">Технології</h2>
      <div className="dark:dark:bg-slate-900 border-2 border-2 w-full py-5 px-4 rounded-xl flex flex-col mb-3">
        <span className="text-xl mb-2">Typescript</span>
        <span className="text-sm">Як javascript тільки краще</span>
      </div>
      <div className="dark:bg-slate-900 border-2 w-full py-4 px-4 rounded-xl flex flex-col mb-3">
        <span className="text-xl mb-2">NextJs</span>
        <span className="text-sm">Вебфреймворк оснований на react</span>
      </div>
      <div className="dark:bg-slate-900 border-2 w-full py-4 px-4 rounded-xl flex flex-col mb-3">
        <span className="text-xl mb-2">Tailwindcss</span>
        <span className="text-sm">CSS фреймворк для простої стилізації</span>
      </div>
      <div className="dark:bg-slate-900 border-2 w-full py-4 px-4 rounded-xl flex flex-col mb-3">
        <span className="text-xl mb-2">PostgreSQL</span>
        <span className="text-sm">Швиденька та потужна база даних</span>
      </div>
      <div className="dark:bg-slate-900 border-2 w-full py-4 px-4 rounded-xl flex flex-col mb-3">
        <span className="text-xl mb-2">trpc</span>
        <span className="text-sm">
          Зберігає типізацію між бекендом та фронтендом
        </span>
      </div>

      <MobileNavigation />
    </main>
  );
}
