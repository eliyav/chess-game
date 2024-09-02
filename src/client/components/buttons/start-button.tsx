import React from "react";

export const SelectionButton: React.FC<{
  text: string;
  onClick: () => void;
}> = ({ text, onClick }) => {
  return (
    <button className={"btn glass-light"} onClick={onClick}>
      {text}
    </button>
  );
};
