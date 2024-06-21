import React from "react";
import { useNavigate } from "react-router-dom";

interface Props {}

const OfflineLobby: React.FC<Props> = () => {
  const navigate = useNavigate();
  return (
    <div>
      <button
        onClick={() =>
          navigate("/match", {
            state: {
              type: "offline",
            },
          })
        }
      >
        Create Match
      </button>
    </div>
  );
};

export default OfflineLobby;
