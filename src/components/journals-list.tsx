import { API_URL } from "@/config";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";

type JournalsListProps = {
  journals?: { link: string; name: string }[];
};

export default function JournalsList({ journals }: JournalsListProps) {
  const [testJournal, _] = useState(
    Boolean(localStorage.getItem("test_journal")),
  );
  console.log(testJournal);
  return (
    <div className="mt-5 mb-12 overflow-auto grow">
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
