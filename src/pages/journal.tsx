import HeaderWithLabel from "@/components/header-with-label";
import { useGetJournalGrades } from "../../orval/default/default";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Spinner from "@/components/spinner";
import { useJournal } from "@/hooks/useJournal";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function JournalPage() {
  const params = useParams();
  const { data, isLoading } = useJournal(parseInt(params.index || "0"));

  const [selected, setSelected] = useState(0);
  console.log(isLoading)
  return (
    <>
      <HeaderWithLabel pageName="Тестовий журнал" />
      <Spinner show={isLoading} />
      <main className="px-4 h-full overflow-y-auto">
        <h1 className="mt-6">{data?.journalName}</h1>
        <div className="flex gap-2 mt-5 overflow-x-auto">
          {data?.controls.map((e, i) => (
            <label
              className={`${i === selected ? "bg-blue-900 dark:bg-blue-600 border-transparent" : "border-blue-50 dark:border-slate-600"} border rounded-lg py-2.5 px-6 block`}
              onChange={() => setSelected(i)}
              key={e.ID}
            >
              {
                // TODO: ПЕРЕПИСАТИ НА ЩОСЬ НОРМАЛЬНЕ ВСЯ ЦЯ СТОРІНКА І ЛОГІКА РОБОТИ З НЕЮ ПРОСТО ЖАХ
                data.grades.find((el) => el.CONTROLNAME === e.NAME)
                  ?.CONTROLSHORTNAME || e.NAME.split(" ")[0]
              }
              <input className="sr-only" type="radio" name="typeOfLesson" />
            </label>
          ))}
        </div>
        <div className="border border-blue-50 dark:border-slate-600 rounded-lg mt-4 px-6 mb-16">
          <div className="flex justify-around py-3.5 border-b border-blue-900">
            <span>Заняття</span>
            <span>Оцінка</span>
          </div>
          <div className="overflow-y-auto">
            {data?.grades
              .filter((el) => el.CONTROLNAME === data.controls[selected].NAME)
              .map((el, i) => (
                <div className="flex py-2 border-t border-gray-200">
                  <span className="block grow text-center">{i + 1}</span>
                  <span className="block grow text-center">
                    {el.GRADE || "-"}
                  </span>
                  <span className="block grow text-center">
                    <InformationCircleIcon width={24} />
                  </span>
                </div>
              ))}
          </div>
        </div>
      </main>
    </>
  );
}
