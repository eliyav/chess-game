import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./views/home";
import LobbySelection from "./views/lobby/lobby";
import OfflineLobby from "./views/lobby/offline-lobby";
import OnlineLobby from "./views/lobby/online-lobby";
import ErrorPage from "./views/error-page";
import Match from "./views/match";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/lobby",
    element: <LobbySelection />,
    children: [
      {
        path: "offline",
        element: <OfflineLobby />,
      },
      {
        path: "online",
        element: <OnlineLobby />,
      },
    ],
  },
  {
    path: "/match",
    element: <Match />,
  },
  {
    path: "*",
    element: <ErrorPage message="Oops, not a valid route!" />,
  },
]);

const App: React.FC = () => {
  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
