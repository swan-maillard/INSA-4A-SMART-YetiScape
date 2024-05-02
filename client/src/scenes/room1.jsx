/* eslint-disable */

import { Engine, Scene, SceneLoader, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight, PointerEventTypes } from "@babylonjs/core";
import "@babylonjs/loaders/OBJ/objFileLoader";

const createScene = (canvas, affiche) => {
  const engine = new Engine(canvas);
  const scene = new Scene(engine);

  const camera = new FreeCamera("camera1", new Vector3(0, 3.8, -8), scene);
  camera.setTarget(new Vector3(0, 2, 5));
  //camera.attachControl(canvas, true); // permet de faire bouger la caméra

  new HemisphericLight("light", Vector3.Up(), scene);

  const materialFond = new StandardMaterial("fondMat");
  materialFond.diffuseColor = Color3.Red();

  const murFond = MeshBuilder.CreateBox("murFond", {width: 10, height:8, depth: 1}, scene);
  murFond.position.x = 0;
  murFond.position.y = 4;
  murFond.position.z = 5;
  murFond.material = materialFond;

  const murGauche = MeshBuilder.CreateBox("murGauche", {width: 1, height:8, depth: 10}, scene);
  murGauche.position.x = -5;
  murGauche.position.y = 4;
  murGauche.position.z = 0;

  const murDroite = MeshBuilder.CreateBox("murDroite", {width: 1, height:8, depth: 10}, scene);
  murDroite.position.x = 5;
  murDroite.position.y = 4;
  murDroite.position.z = 0;

  const ground = MeshBuilder.CreateGround("ground", {width: 10, height: 10}, scene);

  /*SceneLoader.ImportMeshAsync("", "../assets/", "gears.obj")
  .then((res) => console.log('OK'))
  .catch(console.log);*/

  SceneLoader.Append("../assets/", "gears.obj", scene, (scene) => console.log('OK'));
  // const porte = SceneLoader.Load("../assets/", "Porte.obj", engine, function (scene){
  //   //Todo
  // });
  

  engine.runRenderLoop(() => {
    scene.render();
  });

  var startingPoint;
    var currentMesh;

    var getGroundPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

    var pointerDown = function (mesh) {
        currentMesh = mesh;
        affiche('je touche un objet');
        affiche(currentMesh.name)
        startingPoint = getGroundPosition();
    }

    var pointerUp = function () {
        if (startingPoint) {
            startingPoint = null;
            return;
        }
    }
    scene.onPointerObservable.add((pointerInfo) => {      		
        switch (pointerInfo.type) {
			case PointerEventTypes.POINTERDOWN:
				if(pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != ground) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                }
				break;
			case PointerEventTypes.POINTERUP:
                    pointerUp();
				break;
        }
    });
    
};

// deplacement du pointer : https://playground.babylonjs.com/#7CBW04

export { createScene };