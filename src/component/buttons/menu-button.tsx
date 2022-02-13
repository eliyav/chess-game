import React from "react";
import menuIcon from "../../../assets/icons/menu.png";

interface Props {
  open: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MenuButton: React.FC<Props> = ({ open }) => {
  return (
    <img
      className="menu-button"
      alt="Error in loading image"
      src={menuIcon}
      onClick={() => open(true)}
    ></img>
  );
};
