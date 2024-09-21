import { ControllerOptions } from "../../shared/match";

export function buildDefaultOptions(): ControllerOptions {
  return {
    playAnimations: true,
    renderShadows: false,
  };
}

export function getOptionText(option: keyof ControllerOptions) {
  switch (option) {
    case "playAnimations":
      return "Animations";
    case "renderShadows":
      return "Shadows";
  }
}
