import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="absolute w-full flex justify-center items-center h-full z-50">
      <div className="animate-spin h-16 w-16 border-8 border-gold-500 border-t-slate-500 rounded-full"></div>
    </div>
  );
};

export default LoadingScreen;
