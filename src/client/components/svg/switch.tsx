import React from "react";

export const Switch: React.FC<{
  onClick?: () => void;
  className?: string;
}> = ({ className, onClick }) => {
  return (
    <svg
      height="48"
      width="48"
      xmlns="http://www.w3.org/2000/svg"
      className={className || ""}
      onClick={onClick}
    >
      <rect fill="white" fillOpacity="0.01" height="48" width="48" />
      <path
        d="M42 19H5.99998"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M30 7L42 19"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M6.79897 29H42.799"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M6.79895 29L18.799 41"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </svg>
  );
};
