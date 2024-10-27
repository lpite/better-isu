import { API_URL } from "@/config";
import { Link } from "react-router-dom";

type JournalsListProps = {
  journals?: { link: string; name: string }[];
};

export default function JournalsList({ journals }: JournalsListProps) {
  return (
    <div className="mt-5 mb-12 overflow-auto grow">
      {journals?.map(({ name }, i) => (
        <a
          key={name}
          href={`${API_URL}/api/hono/journal?index=${i}`}
          target="_blank"
          className="flex p-1.5 border rounded-lg mb-1.5"
        >
          {name}
        </a>
      ))}
    </div>
  );
}
