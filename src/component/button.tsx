import React from "react";
import "./button.css";

interface Props {
  text: string;
  handler: () => void;
}

const Button: React.FC<Props> = ({ text, handler }) => {
  return (
    <button id="playButton" onClick={handler}>
      {text}
    </button>
  );
};

export default Button;
