import React from "react";

const LoadingScreen: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="screen">
      <div className="loading">
        <p>{text}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
