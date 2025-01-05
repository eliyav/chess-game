import React, { useEffect, useState } from "react";
import { TEAM } from "../../shared/match";
import { Overlay } from "../components/game-overlay/overlay";
import { ClockIcon } from "../components/svg/clock-icon";
import {
  CameraIcon,
  HomeIcon,
  RestartIcon,
  UndoIcon,
} from "../components/svg/game-overlay-icons";
import { Controller } from "../match-logic/controller";
import { Lobby } from "../../shared/lobby";

export const Game: React.FC<{
  matchInfo: Lobby | undefined;
  controller: Controller;
}> = ({ matchInfo, controller }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  useEffect(() => {
    controller.start();
    return () => controller?.cleanup();
  }, [controller.match]);

  useEffect(() => {
    if (!showAnimation) {
      setTimeout(() => {
        setShowAnimation(true);
      }, 500);
    }
  }, []);

  if (matchInfo) {
    return (
      <div>
        <Overlay
          className={
            "z-10 absolute select-none top-0 w-full bg-transparent text-center"
          }
        >
          <div className="max-w-[600px] text-center t m-auto">
            {[
              {
                text: "home",
                onClick: () => controller.leaveMatch(),
                children: (
                  <HomeIcon className="w-6 h-6 bg-transparent m-auto" />
                ),
              },
              {
                text: "restart",
                onClick: () => controller.requestMatchReset(),
                children: (
                  <RestartIcon className="w-6 h-6 bg-transparent m-auto" />
                ),
              },
              {
                text: "undo",
                onClick: () => controller.requestUndoTurn(),
                children: (
                  <UndoIcon className="w-6 h-6 bg-transparent m-auto" />
                ),
              },
              {
                text: "camera",
                onClick: () => controller.resetCamera(),
                children: (
                  <CameraIcon className="w-6 h-6 bg-transparent m-auto" />
                ),
              },
            ].map(({ children, onClick, text }, idx) => (
              <div
                key={idx}
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
            ))}
          </div>
        </Overlay>
        <Overlay
          className={
            "z-10 absolute select-none bottom-0 w-full bg-transparent text-center"
          }
        >
          <div className="h-full p-2 text-white rounded-t-lg max-w-[600px] m-auto gap-x-4">
            {matchInfo?.players.map((player, index) => (
              <div className="inline-block w-1/2" key={index}>
                {player.type === "computer" &&
                  matchInfo.progress !== undefined && (
                    <div>
                      <p className="text-center text-lg font-bold">
                        Calculating...
                      </p>
                      <progress
                        className="w-full h-2.5 mb-2 appearance-none bg-gray-800 rounded overflow-hidden"
                        value={matchInfo.progress}
                        max="100"
                      ></progress>
                    </div>
                  )}
                <div className="flex flex-col items-center bg-slate-700 rounded-lg p-2 m-2 relative min-w-1/3 overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out transform hover:scale-105">
                  <div
                    className={`absolute top-1 transition-all duration-500 ease-in-out ${
                      index % 2 === 0 ? "left-1" : "right-1"
                    } ${
                      matchInfo?.currentTeam === player.team
                        ? "animate-pulse bg-red-500"
                        : player.team === TEAM.WHITE
                        ? "bg-white"
                        : "bg-black"
                    } rounded-full w-4 h-4`}
                  ></div>
                  <p className="font-bold text-lg whitespace-nowrap overflow-hidden text-ellipsis w-3/4 max-w-3/4">
                    {player.name}
                  </p>
                  <div
                    className={`flex items-center overflow-hidden justify-center mt-2 h-0 transition-all duration-1000 ease-in-out ${
                      showAnimation && matchInfo.timers ? "h-10" : ""
                    }`}
                  >
                    <ClockIcon
                      className={`w-8 h-8 mr-1 ${
                        matchInfo?.currentTeam === player.team
                          ? "animate-pulse text-red-500"
                          : ""
                      }`}
                    />
                    <div className="flex items-center space-x-1 text-lg">
                      <span className="font-mono">
                        {matchInfo?.timers?.[player.team].formatted}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Overlay>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-transparent rounded-full"></div>
    </div>
  );
};
