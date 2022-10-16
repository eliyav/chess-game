import React from "react";

interface Lobby {}

export const Lobby: React.FC<Lobby> = () => {
  return (
    <div className="lobby screen">
      <h1 className="sub-title">Lobby</h1>;{/* Game Settings */}
      {/* Start Game Button at bottom */}
      <button onClick={() => {}}>Start</button>
    </div>
  );
};
