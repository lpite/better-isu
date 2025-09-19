import { API_URL } from "@/config";
import { Frown } from "lucide-react";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";

type JournalsListProps = {
  journals?: { link?: string; name: string }[];
  isLoading: boolean;
  error: boolean;
};

export default function JournalsList({
  journals,
  isLoading,
  error,
}: JournalsListProps) {
  const [testJournal, _] = useState(true);
  return (
    <div className="mt-5 mb-12 overflow-auto grow opacity-0 fade-in-with-delay">
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="h-8 w-8 mx-2 border border-blue-700 border-t-transparent animate-spin rounded-full inline-block"></div>
        </div>
      ) : null}
      {!isLoading && error && (
        <div className="w-full h-full flex items-center justify-center gap-3">
          <Frown /> Помилка отримання журналів
        </div>
      )}
      {journals?.map(({ name }, i) => (
        <Fragment key={name}>
          {!testJournal ? (
            <a
              href={`${API_URL}/api/hono/journal?index=${i}`}
              target="_blank"
              className="flex p-1.5 border rounded-lg mb-1.5"
            >
              {name}
            </a>
          ) : (
            <Link
              to={`/journal/${i}`}
              className="flex p-1.5 border rounded-lg mb-1.5"
            >
              {name}
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  );
}
