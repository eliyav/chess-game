export type Settings = {
  playAnimations: boolean;
  renderShadows: boolean;
  playGameSounds: boolean;
  displayAvailableMoves: boolean;
};

export function getSettings(): Settings {
  return {
    displayAvailableMoves: true,
    playAnimations: true,
    renderShadows: false,
    playGameSounds: true,
  };
}

export function getOptionText(option: keyof Settings) {
  switch (option) {
    case "playAnimations":
      return "Animations";
    case "renderShadows":
      return "Shadows";
    case "playGameSounds":
      return "Game Sounds";
    case "displayAvailableMoves":
      return "Display Available Moves";
  }
}
