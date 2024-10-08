import React, { useEffect, useState } from "react";
import whitePlayer from "../../../assets/white-player.png";
import blackPlayer from "../../../assets/black-player.png";
import { Timer } from "../../match-logic/timer";

export const TimerOverlay: React.FC<{
  timer: Timer;
}> = ({ timer }) => {
  const [timer1, setTimer1] = useState(timer.timer1.time);
  const [timer2, setTimer2] = useState(timer.timer2.time);
  const [currentPlayer, setCurrentPlayer] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer1(timer.timer1.time);
      setTimer2(timer.timer2.time);
      setCurrentPlayer(timer.getCurrentPlayer());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="timer">
      <div
        className={`playerTimer ${
          currentPlayer === "White" && "active-player"
        }`}
      >
        <div id="timer1">{timer1}</div>
        <img id="whitePlayer" src={whitePlayer}></img>
      </div>
      <div
        className={`playerTimer ${
          currentPlayer === "Black" && "active-player"
        }`}
      >
        <img id="blackPlayer" src={blackPlayer}></img>
        <div id="timer2">{timer2}</div>
      </div>
    </div>
  );
};
