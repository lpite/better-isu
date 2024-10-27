import BottomNavigation from "@/components/bottom-navigation";
import HeaderWithBurger from "@/components/header-with-burger";
import { AcademicCapIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useGetUserProfile } from "../../orval/default/default";

export default function ProfilePage() {
  const { data: profile } = useGetUserProfile();
  return (
    <>
      <HeaderWithBurger />
      <main className="pt-16 px-4 flex flex-col">
        <h1 className="text-3xl font-semibold mb-2">
          {profile?.name} {profile?.surname}
        </h1>
        <span>Номер заліковки: {profile?.recordNumber}</span>
        <span>{profile?.faculty}</span>
        <span>{profile?.speciality}</span>
        <span>Група: {profile?.group}</span>
        <span>Куратор: -</span>
        <span>Курс: {profile?.course}</span>

        <Link
          to="/rating"
          className="flex justify-between bg-blue-900 dark:bg-blue-600 text-white p-2 mt-5 rounded-lg"
        >
          <div className="flex">
            <AcademicCapIcon width={24} />
            <div className="flex flex-col pl-1.5">
              <span className="text-sm">Рейтинг</span>
              <span className="text-xs">Переглянь свій рейтинг</span>
            </div>
          </div>
          <ChevronRightIcon width={24} />
        </Link>
      </main>
      <BottomNavigation />
    </>
  );
}
