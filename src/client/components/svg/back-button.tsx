import React from "react";

export const BackButton: React.FC<{
  onClick?: () => void;
  className?: string;
  size: number;
}> = ({ className, onClick, size }) => {
  return (
    <svg
      className={className ? className : ""}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      onClick={onClick}
      width={size}
      height={size}
    >
      <path
        fill={"#FFFFFF"}
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm6,12H8.414l2.293,2.293a1,1,0,1,1-1.414,1.414l-4-4a1,1,0,0,1,0-1.414l4-4a1,1,0,1,1,1.414,1.414L8.414,11H18a1,1,0,0,1,0,2Z"
      />
    </svg>
  );
};
