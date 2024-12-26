import { buildDefaultOptions, Lobby, LOBBY_TYPE, TEAM } from "../shared/match";

export function generateKey() {
  const chars = [
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
    ["K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
  ];
  const key = [];
  for (let i = 0; i < 5; i++) {
    const num = Math.floor(Math.random() * 10);
    const charsIndex = Math.random() > 0.5 ? 0 : 1;
    const char = chars[charsIndex][num];
    key[i] = char;
  }
  return key.join("");
}

export function createLobby(): Lobby {
  return {
    mode: LOBBY_TYPE.ONLINE,
    key: generateKey(),
    players: [
      {
        id: "",
        type: "Human",
        name: "Player 1",
        ready: false,
        team: TEAM.WHITE,
      },
      {
        id: "",
        type: "Human",
        name: "Player 2",
        ready: false,
        team: TEAM.BLACK,
      },
    ],
    matchStarted: false,
    controllerOptions: buildDefaultOptions(),
  };
}
