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
    <div className="message-wrapper">
      <div className="message">
        <p className="text">{text}</p>
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
