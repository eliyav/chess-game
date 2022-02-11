import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export const LoginButton = () => {
  const { loginWithPopup, logout, isAuthenticated } = useAuth0();

  return (
    <>
      {isAuthenticated ? (
        <button onClick={() => logout()} className="highlight">
          Log Out
        </button>
      ) : (
        <button onClick={() => loginWithPopup()} className="highlight">
          Log In
        </button>
      )}
    </>
  );
};
