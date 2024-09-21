import React from "react";
import { getOptionText } from "../../match-logic/options";
import { ControllerOptions } from "../../../shared/match";

interface ControllerOptionsProps {
  options: ControllerOptions;
  onChange: (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ControllerOptionsList: React.FC<ControllerOptionsProps> = ({
  options,
  onChange,
}) => {
  return (
    <div className="options-wrapper">
      {Object.entries(options).map(([key, value], i) => (
        <div key={i} className="flex">
          <input type="checkbox" checked={value} onChange={onChange(key)} />
          <label>
            {getOptionText(key as keyof ControllerOptions)}
            {": "}
            <span className={value ? "green-highlight" : "red-highlight"}>
              {value ? "On" : "Off"}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
};
