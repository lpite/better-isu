import HeaderWithLabel from "@/components/header-with-label";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Spinner from "@/components/spinner";
import { useJournal } from "@/hooks/useJournal";

export default function JournalPage() {
  const params = useParams();
  const { data, isLoading } = useJournal(parseInt(params.index || "0"));
  const month = Array.from(
    data?.grades.reduce(
      (p, c) => p.add(c.MONTHSTR.trim()),
      new Set<string>(),
    ) || new Set<string>(),
  );
  return (
    <>
      <HeaderWithLabel pageName="Журнал" />
      <Spinner show={isLoading} />
      <main className="px-4 h-full overflow-y-auto">
        <h1 className="mt-6">{data?.journalName}</h1>
        {/*      <div className="flex gap-2 mt-5 overflow-x-auto">
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
        </div>*/}
        <div className="border border-blue-50 dark:border-slate-600 rounded-lg mt-4 px-6 mb-16">
          <div className="flex  py-3.5 border-b border-blue-900">
            <span className="w-24">Дата</span>
            <span className="w-28">Заняття</span>
            <span className="w-20">Оцінка</span>
          </div>
          <div className="overflow-y-auto">
            {month.map((m) => (
              <div key={m} className="flex flex-col">
                {m === "Сем" ? (
                  <span className="text-2xl font-medium pb-2 pt-4">
                    Семестрова оцінка
                  </span>
                ) : (
                  <span className="font-medium pb-2 pt-4">{m}</span>
                )}
                {data?.grades
                  .filter((gradeRow) => gradeRow.MONTHSTR === m)
                  .map((gradeRow) => (
                    <div
                      key={gradeRow.ROWID + gradeRow.COLID + m}
                      className="flex py-2 border-t border-slate-600"
                    >
                      <span className="block w-24">{gradeRow.DAYNUM}</span>
                      <span className="block w-28">
                        {gradeRow.CONTROLSHORTNAME.replaceAll(
                          "<b>Ат1</b>",
                          "Атестація",
                        )}
                      </span>
                      <span className="block w-20 ">
                        {gradeRow.GRADE || "-"}
                      </span>
                    </div>
                  ))}
              </div>
            ))}

            {/*{data?.grades
              // .filter((el) => el.CONTROLNAME === data.controls[selected].NAME)
              .map((gradeRow, i) => (
                <div
                  key={gradeRow.ROWID + gradeRow.COLID}
                  className="flex py-2 border-t border-gray-200"
                >
                  <span className="block w-20">
                    {gradeRow.CONTROLSHORTNAME}
                  </span>
                  <span className="block w-20 ">{gradeRow.GRADE || "-"}</span>
                </div>
              ))}*/}
          </div>
        </div>
      </main>
    </>
  );
}
