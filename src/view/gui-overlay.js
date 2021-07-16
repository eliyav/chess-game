import * as GUI from "babylonjs-gui";

function createGUI(appContext) {
  const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, appContext.scenes.startScreen);
  const advancedTexture2 = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI2", true, appContext.scenes.gameScreen);

  //Start Screen
  const button = GUI.Button.CreateSimpleButton("button", "Start Offline Game");
  button.width = 0.1;
  button.height = "35px";
  button.color = "white";
  button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  button.paddingTop = "5px";
  button.paddingLeft = "5px";
  advancedTexture.addControl(button);
  button.onPointerUpObservable.add(function () {
    appContext.scenes.activeScene.detachControl();
    appContext.showScene === 0 ? (appContext.showScene = 1) : (appContext.showScene = 0);
  });

  //Game Screen
  const button2 = GUI.Button.CreateSimpleButton("button1", "Home Screen");
  button2.width = 0.1;
  button2.height = "35px";
  button2.color = "white";
  button2.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  button2.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  button2.paddingTop = "5px";
  button2.paddingLeft = "5px";
  advancedTexture2.addControl(button2);
  button2.onPointerUpObservable.add(function () {
    appContext.scenes.activeScene.detachControl();
    appContext.showScene === 0 ? (appContext.showScene = 1) : (appContext.showScene = 0);
  });
}

export default createGUI;
