import HeaderWithLabel from "@/components/header-with-label";
// import {
//   useGetUserProfile,
//   useGetUserRating,
// } from "../../orval/default/default";

export default function RatingPage() {
  // const { data: rating } = useGetUserRating();
  // const { data: profile } = useGetUserProfile();

  return (
    <>
      <HeaderWithLabel pageName="Рейтинг" />
      {/* <main className="px-4 mt-8 pb-24 h-full overflow-auto">
        {rating?.map(({ name, surname }, i) => (
          <div
            key={i}
            className={`text-slate-950 dark:text-white border rounded-lg p-2 mb-1.5 ${name == profile?.name && surname == profile?.surname ? "border-blue-900 dark:border-blue-600" : "border-slate-300 dark:border-slate-600"}`}
          >
            {i + 1}. {name} {surname}
          </div>
        ))}
      </main> */}
    </>
  );
}
