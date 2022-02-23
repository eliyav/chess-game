import React from "react";

interface MessageProps {
  text: string | undefined;
  onConfirm: (() => void) | undefined;
}

export const MessageModal: React.FC<MessageProps> = (props) => {
  return (
    <div className="message-wrapper">
      <div className="message">
        <p className="text">{props.text}</p>
        <button className="confirm" onClick={props.onConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
};
