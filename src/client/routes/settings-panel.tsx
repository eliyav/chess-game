import React from "react";
import { useNavigate } from "react-router-dom";
import { getOptionText, Settings } from "../../shared/settings";

export const SettingsPanel: React.FC<{
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}> = ({ settings, setSettings }) => {
  const navigate = useNavigate();

  const onChange =
    (key: string extends keyof Settings ? keyof Settings : string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings((prev) => ({
        ...prev,
        [key]: e.target.checked,
      }));
    };

  function closeWindow() {
    navigate(-1);
  }

  return (
    <div className="grid grid-rows-5 h-dvh select-none md:w-3/4 md:max-w-4xl md:m-auto z-10">
      <div className="flex grid-rows-1 justify-center align-center glass dark-pane m-4">
        <button
          className="inline-block h-full border-r-2 border-white min-w-16 p-3 hover:bg-white hover:bg-opacity-10"
          onClick={closeWindow}
        >
          Back
        </button>

        {Object.entries(settings).map(([key, value], i) => (
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
            {getOptionText(key)}
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
    </div>
  );
};
