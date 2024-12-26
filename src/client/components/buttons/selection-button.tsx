import React from "react";

export const SelectionButton: React.FC<{
  text: string;
  onClick: () => void;
  disabled?: boolean;
  customClass?: string;
}> = ({ text, onClick, disabled, customClass }) => {
  return (
    <button
      className={`btn glass light-pane ${customClass ? customClass : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};
