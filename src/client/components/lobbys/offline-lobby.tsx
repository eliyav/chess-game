import React from "react";
import { Clock } from "../buttons/clock";

export const OfflineLobby: React.FC<{
  time: number;
  setTime: (time: number) => void;
}> = ({ time, setTime }) => {
  return (
    <div>
      <h2 className="sub-title glass-dark">Opponent</h2>
      <div className="selections">
        <button className="highlight">Human</button>
      </div>
      <Clock time={time} setTime={setTime} />
    </div>
  );
};
