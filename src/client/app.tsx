import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./views/home";

interface Props {
  // Define your component props here
}

const App: React.FC<Props> = () => {
  // Component logic goes here

  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default App;
