import React from "react";
import { Navigate, useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h2 className="home-title">3D Chess</h2>
      <button onClick={() => navigate("/lobby")}>Play!</button>
    </div>
  );
};

export default Home;
