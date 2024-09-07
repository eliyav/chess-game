import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";

export function rotateCamera({
  camera,
  currentPlayer,
}: {
  camera: ArcRotateCamera;
  currentPlayer: string;
}) {
  const isAlphaLessThanZero = camera.alpha < 0;
  const isWhiteTeam = currentPlayer === "White";
  const ratio = isAlphaLessThanZero
    ? Math.ceil(camera.alpha / Math.PI)
    : Math.floor(camera.alpha / Math.PI);
  const subtractedRatio = camera.alpha - ratio * Math.PI;
  const piDistance = isAlphaLessThanZero
    ? Math.abs(Math.PI + subtractedRatio)
    : Math.PI - subtractedRatio;
  const isThereRemainder = ratio % 2;

  let remaining: number;
  if (isWhiteTeam) {
    remaining = isThereRemainder ? Math.PI - piDistance : piDistance;
  } else {
    remaining = isThereRemainder ? piDistance : Math.PI - piDistance;
  }

  animateCameraRotation({
    isWhiteTeam,
    remaining,
    camera,
    isAlphaLessThanZero,
    isThereRemainder,
  });
}

function animateCameraRotation({
  isWhiteTeam,
  remaining,
  isAlphaLessThanZero,
  isThereRemainder,
  camera,
}: {
  isWhiteTeam: boolean;
  remaining: number;
  isAlphaLessThanZero: boolean;
  isThereRemainder: number;
  camera: ArcRotateCamera;
}) {
  requestAnimationFrame(() => {
    const rotateAmount = remaining > 0.05 ? 0.05 : 0.01;
    const direction = isWhiteTeam ? 1 : -1;
    const directionFromCurrentAlpha = isAlphaLessThanZero
      ? direction
      : -direction;

    if (isThereRemainder) {
      camera.alpha += directionFromCurrentAlpha * rotateAmount;
    } else {
      camera.alpha -= directionFromCurrentAlpha * rotateAmount;
    }
    const newRemaining = remaining - rotateAmount;
    if (newRemaining > 0.01) {
      animateCameraRotation({
        isWhiteTeam,
        remaining: newRemaining,
        camera,
        isAlphaLessThanZero,
        isThereRemainder,
      });
    }
  });
}
