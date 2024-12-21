import React from "react";

export const Url: React.FC<{
  onClick?: () => void;
  className?: string;
  size: number;
}> = ({ className, onClick, size }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className ? className : ""}
      onClick={onClick}
      width={size}
      height={size}
    >
      <g id="Glyph">
        <g data-name="Glyph" id="Glyph-2">
          <path d="M57,2H11a1,1,0,0,0-1,1V6H7A1,1,0,0,0,6,7V61a1,1,0,0,0,1,1H53a1,1,0,0,0,1-1V58h3a1,1,0,0,0,1-1V3A1,1,0,0,0,57,2ZM11,11a1,1,0,0,1,2,0v7a2,2,0,0,0,4,0V11a1,1,0,0,1,2,0v7a4,4,0,0,1-8,0ZM52,60H8V26H52ZM28.64,20.23a1,1,0,0,1,.13,1.41A1,1,0,0,1,28,22a1,1,0,0,1-.64-.23L23,18.14V21a1,1,0,0,1-2,0V11a1,1,0,0,1,1-1h3.5a3.5,3.5,0,0,1,0,7h-.74ZM38,20a1,1,0,0,1,0,2H32a1,1,0,0,1-1-1V11a1,1,0,0,1,2,0v9Zm6-5V9.41L50.59,16H45A1,1,0,0,1,44,15ZM56,56H54V17a1,1,0,0,0-.29-.71l-10-10A1,1,0,0,0,43,6H12V4H56Z" />
          <path d="M30,29A14,14,0,1,0,44,43,14,14,0,0,0,30,29Zm2,22h-.61a3,3,0,0,0-2.93,3,3,3,0,0,0,.14.91A12,12,0,0,1,18,43a11.8,11.8,0,0,1,.7-4H29.21a3,3,0,0,0,0-6H27.75a1,1,0,0,1-1-1,1,1,0,0,1,.23-.61A12.33,12.33,0,0,1,30,31,12,12,0,0,1,42,43H26.43a3,3,0,0,0,0,6H32a1,1,0,0,1,0,2Zm7.17-.25a1,1,0,0,1-.34-.75,1,1,0,0,1,.93-1h.64A12,12,0,0,1,39.15,50.75Z" />
          <path d="M27,13.5A1.5,1.5,0,0,1,25.5,15H23V12h2.5A1.5,1.5,0,0,1,27,13.5Z" />
        </g>
      </g>
    </svg>
  );
};