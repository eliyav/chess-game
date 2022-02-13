import React from "react";

interface MessageProps {
  question?: string;
  onConfirm?: () => void;
  onReject?: () => void;
}

const MessageModal: React.VFC<MessageProps> = ({
  onConfirm,
  onReject,
  question,
}) => {
  return (
    <div className="message-wrapper">
      <div className="message">
        <p className="question">{question}</p>
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

export default MessageModal;
