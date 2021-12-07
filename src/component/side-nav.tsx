import React, { useRef } from "react";
import EventEmitter from "../events/event-emitter";
import "./side-nav.css";

interface Props {
  emitter: EventEmitter | undefined;
  setIsNavbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMatchSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideNAV: React.FC<Props> = ({
  emitter,
  setIsNavbarOpen,
  setMatchSettings,
}) => {
  const navbarRef = useRef<HTMLDivElement>(null);

  const navbarSelection = (e: any) => {
    const choice = e.target.innerText;
    if (choice === "Home") {
      const confirm = window.confirm(
        "Are you sure you would like to abandon the game?"
      );
      if (confirm) {
        emitter!.emit("home-screen");
        setIsNavbarOpen(false);
      }
    } else if (choice === "Create Match") {
      setMatchSettings(true);
      setIsNavbarOpen(false);
    } else if (choice === "Join Online") {
      emitter!.emit("join-online-match");
      setIsNavbarOpen(false);
    }
  };

  return (
    <div ref={navbarRef} className={"sidenav"} onClick={navbarSelection}>
      <a
        className="closebtn"
        onClick={() => {
          setIsNavbarOpen(false);
        }}
      >
        &times;
      </a>
      <a>Home</a>
      <div className="category">Matches</div>
      <a>Create Match</a>
      <a>Join Online</a>
    </div>
  );
};

export default SideNAV;
