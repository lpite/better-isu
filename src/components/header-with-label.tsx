import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type HeaderWithLabelProps = {
  pageName: string;
};

export default function HeaderWithLabel({ pageName }: HeaderWithLabelProps) {
  const router = useNavigate();
  return (
    <header className="text-blue-900 dark:text-blue-600 font-medium flex items-center justify-center w-full pt-7">
      <button className="absolute left-4">
        <ChevronLeft onMouseDown={() => router(-1)} width={24} />
      </button>
      <span>{pageName}</span>
    </header>
  );
}
