import BottomNavigation from "@/components/bottom-navigation";
import HeaderWithBurger from "@/components/header-with-burger";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useGroup } from "@/hooks/useGroup";
import { ChevronRight, Users } from "lucide-react";

export default function ProfilePage() {
  const { data: profile } = useProfile();
  const { data: group } = useGroup({
    groupName: profile?.group,
    course: profile?.course,
    facultyName: profile?.faculty,
  });

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
        <span>Куратор: {group?.curatorName}</span>
        <span>Курс: {profile?.course}</span>

        <Link
          to="/rating"
          className="flex justify-between items-center bg-primary text-white p-2 mt-5 rounded-lg"
        >
          <div className="flex items-center">
            <Users height={22} width={22} />
            <div className="flex flex-col pl-2">
              <span className="text-sm">Рейтинг</span>
              <span className="text-xs">Переглянь свій рейтинг</span>
            </div>
          </div>
          <ChevronRight />
        </Link>
      </main>
      <BottomNavigation />
    </>
  );
}
