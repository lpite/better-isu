import { createPortal } from "react-dom";

type AlertNotificationProps = {
  text: string;
  show: boolean;
};

export function AlertNotification({ text, show }: AlertNotificationProps) {
  return createPortal(
    <div
      className={`fixed ${show ? "top-4" : "-top-20"} duration-300 ease-in-out start-1/2 -translate-x-1/2 w-full max-w-64 p-2 bg-yellow-200 flex items-center border rounded-xl`}
    >
      <div className="size-6 mx-2 border-2 border-blue-700 border-t-transparent animate-spin rounded-full inline-block shrink-0"></div>
      {text}
    </div>,
    document.body,
  );
}
