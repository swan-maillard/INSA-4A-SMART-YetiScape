/* eslint-disable */

import { Engine, Scene, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight } from "@babylonjs/core";
const createScene = (canvas) => {
  const engine = new Engine(canvas);
  const scene = new Scene(engine);

  const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);

  new HemisphericLight("light", Vector3.Up(), scene);

  const box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
  const material = new StandardMaterial("box-material", scene);
  material.diffuseColor = Color3.Blue();
  box.material = material;

  const murFond = MeshBuilder.CreateBox("murFond", {width: 10, height:5, depth: 1}, scene);
  murFond.position.x = 0;
  murFond.position.y = 2.5;
  murFond.position.z = 5;

  const ground = MeshBuilder.CreateGround("ground", {width: 10, height: 10}, scene);

  engine.runRenderLoop(() => {
    scene.render();
  });
};

export { createScene };