import React, { useRef } from "react";
import "./side-nav.css";

const SideNav: React.VFC<{
  items: Array<{ text: string; onClick: () => void; className?: string }>;
  onClose: () => void;
}> = ({ items, onClose }) => (
  <div className={"sidenav"}>
    <a
      className="closebtn"
      onClick={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      &times;
    </a>
    {items.map(({ text, onClick, className }, idx) => (
      <button onClick={onClick} className={className} key={idx}>
        {text}
      </button>
    ))}
  </div>
);

export default SideNav;
