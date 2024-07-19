import React from "react";

const clockTimes = [0, 5, 10, 15, 20, 25, 30, 45, 60];

export const Clock: React.FC<{
  time: number;
  setTime: (time: number) => void;
}> = ({ time, setTime }) => {
  return (
    <div className="clock">
      <h2 className="sub-title glass-dark">Game Time</h2>
      <div className="selections">
        {clockTimes.map((clockTime) => (
          <button
            key={clockTime}
            className={`glass-light ${time === clockTime ? "highlight" : ""}`}
            onClick={() => setTime(clockTime)}
          >
            {clockTime ? clockTime : "Unlimited"}
          </button>
        ))}
      </div>
    </div>
  );
};
