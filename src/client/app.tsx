import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./views/home";
import Lobby from "./views/lobby";

interface Props {}

const App: React.FC<Props> = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
      </Routes>
    </div>
  );
};

export default App;
