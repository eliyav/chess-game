import React from "react";

const LoadingScreen: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="loading">
      <p>{text}</p>
    </div>
  );
};

export default LoadingScreen;
