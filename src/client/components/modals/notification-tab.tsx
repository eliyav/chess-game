import React, { useEffect, useState } from "react";

export interface Notification {
  message: string;
}

const NotificationTab: React.FC<Notification> = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [setIsVisible]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, [setIsVisible]);

  return (
    <div
      className={`z-50 fixed top-0 left-0 right-0 p-4 rounded-b-2xl bg-slate-700 border-b-4 border-double text-white font-bold border-slate-200 text-center transition-transform duration-500 overflow-hidden transform ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {message}
    </div>
  );
};

export default NotificationTab;
