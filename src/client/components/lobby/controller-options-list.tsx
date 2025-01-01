import React, { JSX } from "react";

interface ControllerOptionsProps {
  uniqueOptions?: {
    text: string;
    onChange: (e: React.MouseEvent) => void;
    disabled?: boolean;
    className?: string;
    render?: () => JSX.Element;
  }[];
}

export const ControllerOptionsList: React.FC<ControllerOptionsProps> = ({
  uniqueOptions,
}) => {
  return (
    <div className="flex flex-col gap-2 mt-2 items-center w-10/12 m-auto md:w-3/4 ">
      <div className="w-full">
        {uniqueOptions?.map(
          ({ text, onChange, disabled, className, render }, i) => (
            <div className={className ?? ""} key={i}>
              {render ? (
                render()
              ) : (
                <button
                  className={`select-none relative h-16 align-top w-full font-bold bg-slate-700 border-slate-200 text-white p-2 rounded-lg border-2 enabled:hover:opacity-90 ${
                    disabled ? "opacity-50" : ""
                  }`}
                  onClick={onChange}
                  disabled={disabled}
                >
                  {text}
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};
