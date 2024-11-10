import { createPortal } from "react-dom";

type SpinnerProps = {
  show: boolean;
};

export default function Spinner({ show }: SpinnerProps) {
  if (show) {
    return createPortal(
      <div
        className="fixed z-50 inset-x-0 inset-y-0 w-full h-full flex justify-center items-center"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="w-3 absolute border-4 border-blue-600 p-4 rounded-full border-b-transparent animate-spin"></div>
      </div>,
      document.body,
    );
  }

  return null;
}
