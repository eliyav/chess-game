import React from "react";

const LoadingScreen: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="screen">
      <div className="loading screen">
        <p>{text}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
