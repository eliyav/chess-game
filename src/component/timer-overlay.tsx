import React, { useEffect, useState } from "react";
import Timer from "./game/timer";
import whitePlayer from "../../assets/white-player.png";
import blackPlayer from "../../assets/black-player.png";

interface Props {
  timerRef: React.MutableRefObject<Timer>;
  paused: boolean;
}

const TimerOverlay: React.FC<Props> = ({ timerRef, paused }) => {
  const [time, setTime] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      time ? setTime(false) : setTime(true);
    }, 1000);
  }, [timerRef.current.timer1, timerRef.current.timer2, time]);

  useEffect(() => {
    time ? setTime(false) : setTime(true);
  }, [paused]);

  return (
    <div className="timer">
      <div className="playerTimer">
        <div id="timer1">{timerRef.current.timer1}</div>
        <img id="whitePlayer" src={whitePlayer}></img>
      </div>
      <div className="playerTimer">
        <img id="blackPlayer" src={blackPlayer}></img>
        <div id="timer2">{timerRef.current.timer2}</div>
      </div>
    </div>
  );
};

export default TimerOverlay;
