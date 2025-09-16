import { API_URL } from "@/config";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";

type JournalsListProps = {
  journals?: { link?: string; name: string }[];
  isLoading: boolean;
};

export default function JournalsList({
  journals,
  isLoading,
}: JournalsListProps) {
  const [testJournal, _] = useState(true);
  return (
    <div className="mt-5 mb-12 overflow-auto grow opacity-0 fade-in-with-delay">
      {isLoading ? (
        <div className="h-8 w-8 mx-2 border border-blue-700 border-t-transparent animate-spin rounded-full inline-block"></div>
      ) : null}
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
