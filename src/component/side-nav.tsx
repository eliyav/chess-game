import React from "react";
import "./side-nav.css";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handler: (e: any) => void;
}

const SideNAV: React.FC<Props> = ({ isOpen, setIsOpen, handler }) => {
  const navbarClassName = isOpen === false ? "closed" : "open";

  function startOfflineHandler() {
    // emitter!.emit("start-match", "offline");
  }

  return (
    <div
      id="mySidenav"
      className={"sidenav " + navbarClassName}
      onClick={handler}
    >
      <a
        className="closebtn"
        onClick={() => {
          isOpen === false ? setIsOpen(true) : setIsOpen(false);
        }}
      >
        &times;
      </a>
      <div className="category">Matches</div>
      <a className={"test"}>Start Offline</a>
      <a>Create Online</a>
      <a>Join Online</a>
    </div>
  );
};

export default SideNAV;
