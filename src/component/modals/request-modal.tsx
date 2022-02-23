import React from "react";

interface RequestProps {
  question: string;
  onConfirm: () => void;
  onReject: () => void;
}

export const RequestModal: React.VFC<RequestProps> = ({
  onConfirm,
  onReject,
  question,
}) => {
  return (
    <div className="message-wrapper">
      <div className="message">
        <p className="text">{question}</p>
        <button className="confirm" onClick={onConfirm}>
          Yes
        </button>
        <button className="reject" onClick={onReject}>
          No
        </button>
      </div>
    </div>
  );
};
