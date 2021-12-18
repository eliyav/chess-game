import React, { useEffect, useState } from "react";
import Timer from "../game-logic/timer";
import whitePlayer from "../../../assets/white-player.png";
import blackPlayer from "../../../assets/black-player.png";

interface TimerProps {
  timerRef: Timer | undefined;
  paused: boolean;
}

const TimerOverlay: React.VFC<TimerProps> = ({ timerRef, paused }) => {
  const [time, setTime] = useState(false);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      time ? setTime(false) : setTime(true);
    }, 1000);

    return () => {
      clearTimeout(timeOut);
    };
  }, [timerRef!.timer1, timerRef!.timer2, time]);

  useEffect(() => {
    time ? setTime(false) : setTime(true);
  }, [paused]);

  return (
    <div className="timer">
      <div className="playerTimer">
        <div id="timer1">{timerRef!.timer1}</div>
        <img id="whitePlayer" src={whitePlayer}></img>
      </div>
      <div className="playerTimer">
        <img id="blackPlayer" src={blackPlayer}></img>
        <div id="timer2">{timerRef!.timer2}</div>
      </div>
    </div>
  );
};

export default TimerOverlay;
