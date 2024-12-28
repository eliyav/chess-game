import React, { ReactNode } from "react";

const HeaderGameOverlay: React.FC<{
  item: { text: string; onClick: () => void; children: ReactNode };
}> = ({ item: { text, onClick, children } }) => {
  return (
    <div
      className="inline-block text-slate-200 pointer-events-auto w-1/4 max-w-28 transform"
      onClick={onClick}
    >
      <div className="m-1 p-2 bg-slate-700 grow border-2 border-slate-500 rounded-lg hover:bg-slate-600">
        {children}
        <p className="text-center text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </p>
      </div>
    </div>
  );
};

export default HeaderGameOverlay;
