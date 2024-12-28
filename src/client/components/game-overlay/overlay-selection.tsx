import React from "react";

const OverlaySelection: React.FC<{
  item: { text: string; onClick: () => void; iconPath: string };
}> = ({ item: { text, onClick, iconPath } }) => {
  return (
    <div
      className="text-black bg-slate-300 bold pointer-events-auto min-w-16 grow border-2 border-black rounded-lg p-2 border-collapse hover:opacity-80"
      onClick={onClick}
    >
      <img
        className="block h-2/3 object-contain m-auto bg-transparent"
        src={iconPath}
        alt="logo"
      ></img>
      {text.charAt(0).toUpperCase() + text.slice(1)}
    </div>
  );
};

export default OverlaySelection;
