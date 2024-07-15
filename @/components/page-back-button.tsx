import Link from "next/link";

type PageBackButtonProps = {
  backButtonLink: string;
};

export default function PageBackButton({
  backButtonLink,
}: PageBackButtonProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center h-12 border-t-2 bg">
      <Link href={backButtonLink}>
        <a className="pl-2 pr-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 inline mr-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          <span className="inline">Повернутися</span>
        </a>
      </Link>
    </div>
  );
}
