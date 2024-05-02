/* eslint-disable */

import { Engine, Scene, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight } from "@babylonjs/core";
const createScene = (canvas) => {
  const engine = new Engine(canvas);
  const scene = new Scene(engine);

  const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);

  new HemisphericLight("light", Vector3.Up(), scene);

  const materialFond = new StandardMaterial("fondMat");
  materialFond.diffuseColor = Color3.Red();

  const murFond = MeshBuilder.CreateBox("murFond", {width: 10, height:5, depth: 1}, scene);
  murFond.position.x = 0;
  murFond.position.y = 2.5;
  murFond.position.z = 5;
  murFond.material = materialFond;

  const murGauche = MeshBuilder.CreateBox("murFond", {width: 1, height:5, depth: 10}, scene);
  murGauche.position.x = -5;
  murGauche.position.y = 2.5;
  murGauche.position.z = 0;

  const murDroite = MeshBuilder.CreateBox("murFond", {width: 1, height:5, depth: 10}, scene);
  murDroite.position.x = 5;
  murDroite.position.y = 2.5;
  murDroite.position.z = 0;

  const ground = MeshBuilder.CreateGround("ground", {width: 10, height: 10}, scene);

  engine.runRenderLoop(() => {
    scene.render();
  });
};

export { createScene };