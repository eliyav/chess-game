import React, { useRef, useState } from "react";

const SettingsTeams: React.FC = () => {
  const [isDefaultChecked, setIsDefaultChecked] = useState(true);
  const whiteTeamRef = useRef<HTMLInputElement>(null);
  const blackTeamRef = useRef<HTMLInputElement>(null);

  return (
    <div className="subsection">
      <p>Select team color</p>
      <input
        ref={whiteTeamRef}
        type="radio"
        name="team"
        value="White"
        defaultChecked={true}
        className="hide"
      ></input>
      <label
        className={isDefaultChecked === true ? "option highlighted" : "option"}
        onClick={() => {
          whiteTeamRef.current!.checked = true;
          setIsDefaultChecked(true);
        }}
      >
        White
      </label>
      <input
        ref={blackTeamRef}
        type="radio"
        name="team"
        value="Black"
        className="hide"
      ></input>
      <label
        className={isDefaultChecked === false ? "option highlighted" : "option"}
        onClick={() => {
          blackTeamRef.current!.checked = true;
          setIsDefaultChecked(false);
        }}
      >
        Black
      </label>
    </div>
  );
};

export default SettingsTeams;
