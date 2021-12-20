import React from "react";

interface InviteProps {
  code: string | undefined;
  onClose: () => void;
}

const InviteCode: React.VFC<InviteProps> = ({ code, onClose }) => {
  return (
    <div className="match-settings-modal">
      <div className="gameOptionsScreen">
        <a className="closeBtn" onClick={onClose}>
          &times;
        </a>
        <p className="title">Your Invite Code is:</p>
        <div className="subsection">
          <p id="inviteCode">{code}</p>
          <p>Please wait for opponent to join match</p>
        </div>
      </div>
    </div>
  );
};

export default InviteCode;
