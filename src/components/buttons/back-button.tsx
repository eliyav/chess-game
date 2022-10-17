import React from "react";
const svgUrl = new URL("../../../assets/icons/back-icon.svg", import.meta.url);

export const BackButton: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <img
      className="return-btn"
      onClick={() => onClick()}
      src={svgUrl.href}
      alt="Back Button"
    />
  );
};
