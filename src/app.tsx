import React, { useEffect, useState } from "react";
import { Content } from "./content";
import { useAuth0 } from "@auth0/auth0-react";
import { getUserInfo } from "./helper/request-helpers";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserData>();
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

  return (
    <div id="app">
      <Content userData={currentUser} />
    </div>
  );
};

export default App;

export interface UserData {
  [key: string]: string;
  picture: string;
  name: string;
}
