import React from "react";

export const SelectionButton: React.FC<{
  text: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ text, onClick, disabled }) => {
  return (
    <button className={"btn glass-light"} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};
