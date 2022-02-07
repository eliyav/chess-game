import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export const LoginButton = () => {
  const { loginWithPopup, logout, isAuthenticated } = useAuth0();

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={() => logout()}>Log Out</button>
      ) : (
        <button onClick={() => loginWithPopup()}>Log In</button>
      )}
    </div>
  );
};
