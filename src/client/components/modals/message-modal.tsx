import React from "react";

export type Message = {
  text: string;
  onConfirm: () => void;
  onReject?: () => void;
};

export const MessageModal: React.FC<Message> = ({
  onConfirm,
  onReject,
  text,
}) => {
  return (
    <div className="absolute z-50 inset-0 flex justify-center items-center m-2">
      <div className="bg-slate-200 p-4 rounded-lg border-2 border-black">
        <p className="mb-4">{text}</p>
        <div className="flex gap-2 justify-center">
          <button
            className="bg-green-500 p-2 rounded border-2 border-black min-w-20"
            onClick={onConfirm}
          >
            Confirm
          </button>
          {onReject && (
            <button
              className="bg-red-500 p-2 rounded border-2 border-black min-w-20"
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
