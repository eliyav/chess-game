import React, { useRef } from "react";
import "./side-nav.css";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectionHandler: (e: any) => void;
}

const SideNAV: React.FC<Props> = ({ isOpen, setIsOpen, selectionHandler }) => {
  const navbarRef = useRef<HTMLDivElement>(null);
  isOpen === true
    ? navbarRef.current?.classList.add("open")
    : navbarRef.current?.classList.remove("open");

  return (
    <div ref={navbarRef} className={"sidenav"} onClick={selectionHandler}>
      <a
        className="closebtn"
        onClick={() => {
          isOpen === false ? setIsOpen(true) : setIsOpen(false);
        }}
      >
        &times;
      </a>
      <div className="category">Matches</div>
      <a>Start Offline</a>
      <a>Create Online</a>
      <a>Join Online</a>
    </div>
  );
};

export default SideNAV;
