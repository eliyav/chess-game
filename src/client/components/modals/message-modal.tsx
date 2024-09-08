import React from "react";

export type Message = {
  question: string;
  onConfirm: () => void;
  onReject?: () => void;
};

export const MessageModal: React.FC<Message> = ({
  onConfirm,
  onReject,
  question,
}) => {
  return (
    <div className="message-wrapper">
      <div className="message">
        <p className="text">{question}</p>
        <button className="confirm" onClick={onConfirm}>
          Confirm
        </button>
        {onReject && (
          <button className="reject" onClick={onReject}>
            Reject
          </button>
        )}
      </div>
    </div>
  );
};
