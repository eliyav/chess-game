import React from "react";
import * as icons from "./icons";

export type IconsIndex = keyof typeof icons;

interface Props {
  name: IconsIndex;
}

const OverlaySelection: React.FC<Props> = ({ name }) => {
  return (
    <div className="item">
      <img src={icons[name]} alt="logo"></img>
      {name.charAt(0).toUpperCase() + name.slice(1)}
    </div>
  );
};

export default OverlaySelection;
