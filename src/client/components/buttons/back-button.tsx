import React from "react";
import backSvg from "../../../../assets/icons/back-icon.svg";

export const BackButton: React.FC<{
  onClick: () => void;
  size?: number;
  customClass?: string;
}> = ({ onClick, size, customClass }) => {
  return (
    <img
      className={`${customClass ?? ""}`}
      onClick={() => onClick()}
      src={backSvg}
      alt="Back Button"
      width={size}
      height={size}
    />
  );
};
