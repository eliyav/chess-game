import React, { useRef } from "react";
import { LobbySettings } from "../../routes/online-lobby";

const Time: React.FC<{
  setTime: React.Dispatch<React.SetStateAction<LobbySettings>>;
}> = ({ setTime }) => {
  const timeRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <p className="label">Time on clock</p>
      <input
        className="slider"
        name="time"
        type="range"
        min="0"
        max="60"
        step="10"
        defaultValue="0"
        onChange={(e) => {
          const value = e.currentTarget.value;
          timeRef.current!.innerText = value;
          setTime((prevState) => ({ ...prevState, time: parseInt(value) }));
        }}
      ></input>
      <div className="time-display" ref={timeRef}>
        0
      </div>
    </>
  );
};

export default Time;
