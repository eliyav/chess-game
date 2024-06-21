import React from "react";
import { useLocation } from "react-router-dom";

const Match: React.FC = () => {
  const { state } = useLocation();
  //state property will have match creation options in it
  return <div>{state?.type} Match</div>;
};

export default Match;
