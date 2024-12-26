import React from "react";

export const Checkmark: React.FC<{
  onClick?: () => void;
  className?: string;
  size?: number;
}> = ({ className, onClick, size }) => {
  return (
    <svg
      viewBox="0 0 512 512"
      version="1.1"
      xmlSpace="preserve"
      className={className ? className : ""}
      onClick={onClick}
      width={size ? size : 50}
      height={size ? size : 50}
    >
      <g>
        <polygon
          fill="#41AD49"
          points="434.8,49 174.2,309.7 76.8,212.3 0,289.2 174.1,463.3 196.6,440.9 196.6,440.9 511.7,125.8 434.8,49     "
        />
      </g>
    </svg>
  );
};
