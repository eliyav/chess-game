import React from "react";

export const XIcon: React.FC<{
  onClick?: () => void;
  className?: string;
  size?: number;
}> = ({ className, onClick, size }) => {
  return (
    <svg
      version="1.1"
      viewBox="0 0 612 792"
      className={className ? className : ""}
      onClick={onClick}
      width={size ? size : 50}
      height={size ? size : 50}
    >
      <g>
        <polygon
          fill="#E44061"
          points="382.2,396.4 560.8,217.8 484,141 305.4,319.6 126.8,141 50,217.8 228.6,396.4 50,575 126.8,651.8    305.4,473.2 484,651.8 560.8,575 382.2,396.4  "
        />
      </g>
    </svg>
  );
};
