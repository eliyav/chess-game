import React from "react";

const Header: React.FC<{
  text: string;
}> = ({ text }) => {
  return <h2 className="header">{text}</h2>;
};

export default Header;
