import React from "react";
import { ControllerOptions, getOptionText } from "../../../shared/match";

interface ControllerOptionsProps {
  options: ControllerOptions;
  onChange: (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchTeams?: () => void;
  disableSwitchTeams?: boolean;
}

export const ControllerOptionsList: React.FC<ControllerOptionsProps> = ({
  options,
  onChange,
  onSwitchTeams,
  disableSwitchTeams,
}) => {
  return (
    <div className="flex flex-col gap-2 mt-2 items-center w-9/12 m-auto ">
      {onSwitchTeams && (
        <button
          className={`select-none flex relative bg-slate-200 w-full p-2 rounded-lg border-2 hover:opacity-90 place-content-center ${
            disableSwitchTeams ? "opacity-50" : ""
          }`}
          onClick={onSwitchTeams}
          disabled={disableSwitchTeams}
        >
          {"Switch Teams"}
        </button>
      )}
      {Object.entries(options).map(([key, value], i) => (
        <label
          key={i}
          className={`select-none flex relative bg-slate-200 w-full p-2 rounded-lg border-2 hover:opacity-80 ${
            value ? "border-green-500" : "border-red-500"
          }`}
        >
          <input
            type="checkbox"
            className="hidden"
            checked={value}
            onChange={onChange(key)}
          />
          {getOptionText(key as keyof ControllerOptions)}
          <span
            className={`absolute right-2 font-bold ${
              value ? "text-green-500" : "text-red-500"
            }`}
          >
            {value ? "ON" : "OFF"}
          </span>
        </label>
      ))}
    </div>
  );
};
