import React, { useRef } from "react";
import { App } from "./app";
import OverlaySelection, { IconsIndex } from "./game-overlay-selection";
import "./game-overlay.css";

interface Props {
  chessRef: React.MutableRefObject<App | undefined>;
  playBtn: React.RefObject<HTMLButtonElement>;
  setIsGameScreen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNavbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isNavbarOpen: boolean;
}

const GameOverlay: React.FC<Props> = ({
  chessRef,
  playBtn,
  setIsGameScreen,
  setIsNavbarOpen,
  isNavbarOpen,
}) => {
  const overlaySelection = (e: any) => {
    const choice = e.target.innerText;
    if (choice === "Restart") {
      chessRef!.current!.emitter!.emit("reset-board");
    } else if (choice === "Undo") {
      chessRef!.current!.emitter!.emit("undo-move");
    } else if (choice === "Camera") {
      chessRef!.current!.emitter!.emit("reset-camera");
    } else if (choice === "Menu") {
      isNavbarOpen ? setIsNavbarOpen(false) : setIsNavbarOpen(true);
    } else if (choice === "Home") {
      const confirm = window.confirm(
        "Are you sure you would like to abandon the game?"
      );
      if (confirm) {
        setIsGameScreen(false);
        chessRef!.current!.emitter!.emit("home-screen");
        playBtn.current?.classList.remove("hide");
      }
    }
  };

  const gameOverlayRef = useRef<HTMLDivElement>(null);
  const overlaySelections: IconsIndex[] = [
    "menu",
    "home",
    "restart",
    "camera",
    "undo",
  ];

  return (
    <div
      ref={gameOverlayRef}
      className={"gameOverlay"}
      onClick={overlaySelection}
    >
      {overlaySelections.map((str, idx) => (
        <OverlaySelection name={str} key={idx} />
      ))}
    </div>
  );
};

export default GameOverlay;
