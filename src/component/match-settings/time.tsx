import React, { useRef } from "react";

const Time: React.VFC<{
  time: React.Dispatch<React.SetStateAction<number>>;
}> = ({ time }) => {
  const timeRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <p className="label">Time on clock:</p>
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
          time(parseInt(value));
        }}
      ></input>
      <div className="time-display" ref={timeRef}>
        0
      </div>
    </>
  );
};

export default Time;
