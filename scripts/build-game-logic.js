import fs from "fs";
import path from "path";

const filePath = path.join("public", "game-logic.js");
const searchString = "var game_default = Game;";
const replaceString = `
var game_default = Game;
(function() {
  if (typeof Game !== 'undefined') {
    self.Game = Game;
  }
})();
`;

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Failed to read game-logic.js:", err);
    return;
  }

  const result = data.replace(searchString, replaceString);

  fs.writeFile(filePath, result, "utf8", (err) => {
    if (err) {
      console.error("Failed to write game-logic.js:", err);
    } else {
      console.log("Successfully updated game-logic.js");
    }
  });
});
