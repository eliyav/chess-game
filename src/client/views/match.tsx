import React from "react";
import { useLocation } from "react-router-dom";
import GameScene from "../scene/game-scene";

const Match: React.FC = () => {
  //state property will have match creation options in it
  const { state } = useLocation();
  return <GameScene />;
};

export default Match;
