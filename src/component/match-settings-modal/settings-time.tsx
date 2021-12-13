import React, { useRef } from "react";

const SettingsTime: React.VFC = () => {
  const timeRef = useRef<HTMLInputElement>(null);

  return (
    <div className="subsection">
      <p>Select Minutes on Clock</p>
      <input
        name="time"
        type="range"
        min="0"
        max="60"
        step="10"
        defaultValue="0"
        onChange={(e) => {
          const value = e.currentTarget.value;
          timeRef.current!.innerText = value;
        }}
      ></input>
      <div ref={timeRef}>0</div>
    </div>
  );
};

export default SettingsTime;
