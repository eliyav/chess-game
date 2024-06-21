import React from "react";
import Header from "../../components/header";
import { Outlet, useNavigate } from "react-router-dom";

const LobbySelection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Header text="Lobby" />
      <button onClick={() => navigate("/lobby/offline")}>Offline Lobby</button>
      <button onClick={() => navigate("/lobby/online")}>Online Lobby</button>
      <Outlet />
    </div>
  );
};

export default LobbySelection;
