import React from "react";

const LoadingScreen: React.VFC<{ text: string }> = ({ text }) => {
  return (
    <div className="loading">
      <p>{text}</p>
    </div>
  );
};

export default LoadingScreen;
