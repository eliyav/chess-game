import React from "react";

export const Overlay: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ children, className }) => {
  return <div className={className || ""}>{children}</div>;
};
