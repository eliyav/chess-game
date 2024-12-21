import React from "react";

export const ClipboardAdd: React.FC<{
  onClick?: () => void;
  className?: string;
  size: number;
}> = ({ className, onClick, size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className ? className : ""}
      onClick={onClick}
      width={size}
      height={size}
    >
      <path
        d="M18,4 L19,4 C20.1045695,4 21,4.8954305 21,6 L21,21 C21,22.1045695 20.1045695,23 19,23 L5,23 C3.8954305,23 3,22.1045695 3,21 L3,6 C3,4.8954305 3.8954305,4 5,4 L6,4 C6,2.8954305 6.8954305,2 8,2 L8.99592076,2 C9.74819983,1.36297463 10.8391373,1 12,1 C13.1608627,1 14.2518002,1.36297463 15.0040792,2 L16,2 C17.1045695,2 18,2.8954305 18,4 Z M6.26756439,6 L5,6 L5,21 L19,21 L19,6 L17.7324356,6 C17.3866262,6.59780137 16.7402824,7 16,7 L8,7 C7.25971764,7 6.61337381,6.59780137 6.26756439,6 Z M11,13 L11,10 L13,10 L13,13 L16,13 L16,15 L13,15 L13,18 L11,18 L11,15 L8,15 L8,13 L11,13 Z M10.1566481,3.65537749 L9.85761804,4 L9.40134659,4 L8,4 L8,5 L16,5 L16,4 L14.142382,4 L13.8433519,3.65537749 C13.5148073,3.27674041 12.8105871,3 12,3 C11.1894129,3 10.4851927,3.27674041 10.1566481,3.65537749 Z"
        fill-rule="evenodd"
      />
    </svg>
  );
};
