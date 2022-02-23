import React from "react";
import { UserData } from "../app";

export const Profile: React.FC<{ data: UserData }> = ({
  data: { name, picture },
}) => {
  return (
    <div className="profile-wrapper">
      <div className="profile">
        <div className="header">
          <img src={picture}></img>
          <p>{name}</p>
        </div>
        <p className="label">Past Matches</p>
        <div className="past-matches">
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>{" "}
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>{" "}
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>{" "}
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>{" "}
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>{" "}
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>{" "}
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>{" "}
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>{" "}
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>{" "}
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>{" "}
          <div className="past-match">
            <p>W</p>
            <p>14:45</p>
            <p>Match Log</p>
          </div>
        </div>
        <div className="saved-matches">
          <ul>
            <li>Saved Game 1</li>
            <li>Saved Game 2</li>
            <li>Saved Game 3</li>
            <li>Saved Game 4</li>
            <li>Saved Game 5</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
