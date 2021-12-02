import React from "react";
import "./loading-screen.css";

interface Props {}

const LoadingScreen: React.FC<Props> = () => {
  return (
    <div id="loading">
      <p>Loading</p>
    </div>
  );
};

export default LoadingScreen;