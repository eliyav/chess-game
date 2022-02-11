import React from "react";
import { LoginButton } from "./auth0/login";
import "../styles/side-nav.css";

const SideNav: React.VFC<{
  items: Array<{ text: string; onClick?: () => void; className?: string }>;
  onClose: () => void;
  userItems: Array<{ text: string; onClick?: () => void; className?: string }>;
  isLoggedIn: boolean;
}> = ({ items, onClose, isLoggedIn, userItems }) => (
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
    <LoginButton />
    {items.map(({ text, onClick, className }, idx) => (
      <button onClick={onClick} className={className} key={idx}>
        {text}
      </button>
    ))}
    {isLoggedIn
      ? userItems.map(({ text, onClick, className }, idx) => (
          <button onClick={onClick} className={className} key={idx}>
            {text}
          </button>
        ))
      : null}
  </div>
);

export default SideNav;
