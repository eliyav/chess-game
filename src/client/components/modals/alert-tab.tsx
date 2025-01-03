import React, { useEffect, useState } from "react";

const alertAnimationTime = 500;

export interface Alert {
  message: string;
}

const AlertTab: React.FC<{ close: () => void } & Alert> = ({
  message,
  close,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const visibleTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    const closeTimeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => close && close(), alertAnimationTime);
    }, 2000);

    return () => {
      clearTimeout(visibleTimeout);
      clearTimeout(closeTimeout);
    };
  }, [setIsVisible]);

  return (
    <div
      className={`z-50 fixed top-0 left-0 right-0 p-4 rounded-b-2xl bg-slate-700 border-b-4 border-double text-white font-bold border-slate-200 text-center transition-transform duration-${alertAnimationTime} overflow-hidden transform ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {message}
    </div>
  );
};

export default AlertTab;
