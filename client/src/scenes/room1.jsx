/* eslint-disable */

import { Engine, Scene, SceneLoader, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight, PointerEventTypes } from "@babylonjs/core";
import "@babylonjs/loaders";

const createScene = (canvas, affiche) => {
  const engine = new Engine(canvas);
  const scene = new Scene(engine);

  const camera = new FreeCamera("camera1", new Vector3(0, 1.6, -4), scene);
  camera.setTarget(new Vector3(0, 2, 5));
  camera.attachControl(canvas, true); // permet de faire bouger la caméra

  new HemisphericLight("light", Vector3.Up(), scene);

  const materialFond = new StandardMaterial("fondMat");
  materialFond.diffuseColor = Color3.Red();

  const murFond = MeshBuilder.CreateBox("murFond", {width: 10, height:4, depth: 1}, scene);
  var posFond = new Vector3(0,2,5);
  murFond.position = posFond;
  murFond.material = materialFond;

  const murGauche = MeshBuilder.CreateBox("murGauche", {width: 1, height:4, depth: 10}, scene);
  var posGauche = new Vector3(-5,2,0);
  murGauche.position = posGauche;

  const murDroite = MeshBuilder.CreateBox("murDroite", {width: 1, height:4, depth: 10}, scene);
  var posDroite = new Vector3(5,2,0);
  murDroite.position = posDroite;

  const ground = MeshBuilder.CreateGround("ground", {width: 10, height: 10}, scene);
  const roof = MeshBuilder.CreateGround("roof", {width: 10, height: 10}, scene);
  roof.position.y = 10

  const result = SceneLoader.ImportMeshAsync("","./models/", "porte.glb", scene, (meshes)=>{
    console.log("infos meshes: "+meshes);
    });
  result.then((resultat)=>{
        for(var i=1; i<resultat.meshes.length; i++)
        {
            resultat.meshes[i].position.z = 4;
        }    
    })

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