import React from "react";

interface Props {}

const LoadingScreen: React.FC<Props> = () => {
  return (
    <div id="loading">
      <p>Loading</p>
    </div>
  );
};

export default LoadingScreen;
