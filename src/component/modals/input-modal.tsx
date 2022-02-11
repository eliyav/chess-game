import React from "react";
import "../../styles/input-modal.css";

interface InputProps {
  text: string | undefined;
  onConfirm: (() => void) | undefined;
  onReject: (() => void) | undefined;
}

const InputModal = React.forwardRef(
  (props: InputProps, ref: React.LegacyRef<HTMLInputElement>) => {
    return (
      <div className="input-wrapper">
        <div className="message">
          <p className="text">{props.text}</p>
          <input ref={ref} type={props.text} placeholder="Enter Here"></input>
          <button className="confirm" onClick={props.onConfirm}>
            Confirm
          </button>
          <button className="reject" onClick={props.onReject}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
);

export default InputModal;
