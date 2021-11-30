import React from "react";
import "./side-nav.css";
import EventEmitter from "../events/event-emitter";

interface Props {
  emitter?: EventEmitter;
}

const SideNAV: React.FC<Props> = ({ emitter }) => {
  function hidePlayButton() {
    const playButton = document.getElementById(
      "playButton"
    ) as HTMLButtonElement;
    playButton.style.display = "none";
  }

  function closeNav() {
    const sidebar = document.getElementById("mySidenav") as HTMLDivElement;
    sidebar.style.width = "0";
  }

  function startOfflineHandler() {
    emitter!.emit("start-match", "offline");
    hidePlayButton();
    closeNav();
  }

  return (
    <div id="mySidenav" className="sidenav">
      <a className="closebtn" onClick={closeNav}>
        &times;
      </a>
      <div className="category">Matches</div>
      <a onClick={startOfflineHandler}>Start Offline</a>
      <a>Create Online</a>
      <a>Join Online</a>
    </div>
  );
};

export default SideNAV;
