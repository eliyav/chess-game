import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getUserInfo } from "../helper/request-helpers";
import { UserData } from "../app";

export const useAuthentication = (
  setCurrentUser: React.Dispatch<React.SetStateAction<UserData | undefined>>
) => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (isAuthenticated)
      (async () => {
        try {
          const token = await getAccessTokenSilently();
          const response = await fetch(`${window.location.host}/login`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: getUserInfo(user!),
          });
          const userData: UserData = await response.json();
          setCurrentUser(userData);
        } catch (err) {
          console.error(err);
        }
      })();
  }, [isAuthenticated]);

  return [user, isAuthenticated];
};
