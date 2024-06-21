import React from "react";

type Prompt = {
  text: string | undefined;
  onConfirm: (() => void) | undefined;
};

export const PromptModal: React.FC<Prompt> = (props) => {
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
