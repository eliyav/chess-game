import React from "react";

interface Props {
  code: string;
}

const InviteCode: React.FC<Props> = ({ code }) => {
  return (
    <div id="match-settings-modal">
      <div id="inviteCode">
        <p>Your Invite Code is:</p>
        <p>{code}</p>
        <p>Please wait for opponent to join match</p>
      </div>
    </div>
  );
};

export default InviteCode;
