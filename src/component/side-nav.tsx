import React, { useRef } from "react";
import { App } from "./app";
import "./side-nav.css";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chessRef: React.MutableRefObject<App | undefined>;
  playBtn: React.RefObject<HTMLButtonElement>;
  setIsGameScreen: React.Dispatch<React.SetStateAction<boolean>>;
  setMatchModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideNAV: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  chessRef,
  playBtn,
  setIsGameScreen,
  setMatchModal,
}) => {
  const navbarRef = useRef<HTMLDivElement>(null);

  isOpen === true
    ? navbarRef.current?.classList.add("open")
    : navbarRef.current?.classList.remove("open");

  const navbarSelection = (e: any) => {
    const choice = e.target.innerText;
    setIsOpen(false);
    if (choice === "Start Offline") {
      playBtn.current?.classList.add("hide");
      chessRef!.current!.emitter!.emit("start-match", "offline");
      setIsGameScreen(true);
    }
    // } else if (choice === "Create Online") {
    //   setMatchModal(true);
    //   playBtn.current?.classList.add("hide");
    //   setIsGameScreen(true);
    // } else if (choice === "Join Online") {
    //   chessRef!.current!.emitter!.emit("join-online-match");
    //   playBtn.current?.classList.add("hide");
    //   setIsGameScreen(true);
    // }
  };

  return (
    <div ref={navbarRef} className={"sidenav"} onClick={navbarSelection}>
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
