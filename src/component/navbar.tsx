import React from "react";
import { Link } from "react-router-dom";
import { LoginButton } from "./auth0/login";

export const Navbar: React.VFC<{
  items: Array<{
    text: string;
    path: string;
  }>;
  onClose: () => void;
  userItems: Array<{ text: string }>;
  isLoggedIn: boolean;
}> = ({ items, onClose, isLoggedIn, userItems }) => (
  <div className="sidenav">
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
    {items.map(({ text, path }, idx) => (
      <button onClick={onClose} key={idx}>
        <Link to={path}>{text}</Link>
      </button>
    ))}
    {isLoggedIn
      ? userItems.map(({ text }, idx) => (
          <button onClick={onClose} key={idx}>
            {text}
          </button>
        ))
      : null}
  </div>
);
