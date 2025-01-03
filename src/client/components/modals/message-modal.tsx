import React, { ReactNode } from "react";

export type Message = {
  text: string;
  onConfirm: () => void;
  onReject?: () => void;
  children?: ReactNode;
};

export const MessageModal: React.FC<Message> = ({
  onConfirm,
  onReject,
  text,
  children,
}) => {
  return (
    <div className="absolute z-50  inset-0 flex justify-center items-center m-2">
      <div className="bg-slate-700 p-6 rounded-lg border-4 border-double border-bg-slate-200 shadow-lg max-w-lg w-full">
        <p className="mb-4 text-lg font-semibold text-center bg-slate-300 p-2 rounded">
          {text}
        </p>
        {children && <div className="mb-4">{children}</div>}
        <div className="flex gap-2 justify-center">
          <button
            className="bg-green-500 p-2 rounded-xl font-mono font-bold border-2 border-black min-w-20 hover:bg-green-600"
            onClick={onConfirm}
          >
            Confirm
          </button>
          {onReject && (
            <button
              className="bg-red-500 p-2 rounded-xl font-mono font-bold border-2 border-black min-w-20 hover:bg-red-600"
              onClick={onReject}
            >
              Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
