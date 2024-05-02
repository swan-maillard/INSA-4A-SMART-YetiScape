/* eslint-disable */
import { Texture, Engine, Scene, SceneLoader, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight, PointerEventTypes } from "@babylonjs/core";
import "@babylonjs/loaders";

const createScene = (canvas, verif) => {
  const engine = new Engine(canvas);
  const scene = new Scene(engine);

  const camera = new FreeCamera("camera1", new Vector3(0, 1.6, -3), scene);
  camera.setTarget(new Vector3(0, 2, 5));
  camera.attachControl(canvas, true); // permet de faire bouger la caméra

  new HemisphericLight("light", Vector3.Up(), scene);

  const texture = new Texture("./textures/mur.jpg",scene);
  const materialMur = new StandardMaterial("matMur");
  materialMur.diffuseTexture = texture;
  
  const textureRouille = new Texture("./textures/rouille.jpg",scene);
  const matRouille = new StandardMaterial("matRouille");
  matRouille.diffuseTexture = textureRouille;

  const textureDoor = new Texture("./textures/door.jpg",scene);
  const materialDoor = new StandardMaterial("matDoor");
  materialDoor.diffuseTexture = textureDoor;

  const murFond = MeshBuilder.CreateBox("murFond", {width: 10, height:4, depth: 1}, scene);
  var posFond = new Vector3(0,2,5);
  murFond.position = posFond;
  murFond.material = materialMur;

  const murDos = MeshBuilder.CreateBox("murDos", {width: 10, height:4, depth: 1}, scene);
  var posDos = new Vector3(0,2,-5);
  murDos.position = posDos;
  murDos.material = materialMur;

  const murGauche = MeshBuilder.CreateBox("murGauche", {width: 1, height:4, depth: 10}, scene);
  var posGauche = new Vector3(-5,2,0);
  murGauche.position = posGauche;
  murGauche.material = materialMur;

  const murDroite = MeshBuilder.CreateBox("murDroite", {width: 1, height:4, depth: 10}, scene);
  var posDroite = new Vector3(5,2,0);
  murDroite.position = posDroite;
  murDroite.material = materialMur;

  const ground = MeshBuilder.CreateGround("ground", {width: 10, height: 10}, scene);
  ground.material = materialMur;

  const result = SceneLoader.ImportMeshAsync("","./models/", "porte.glb", scene, (meshes)=>{
    console.log("infos meshes: "+meshes);
    });
  result.then((resultat)=>{
        console.log('dabord : ' + resultat.meshes.length)
        for(var i=1; i<resultat.meshes.length; i++)
        {
            resultat.meshes[i].position.z = 4;
            resultat.meshes[i].material = materialDoor;
        }    
    })

    var gear;
    SceneLoader.ImportMeshAsync("engrenageMoyen","./models/", "engrenageMoyen.glb", scene, (meshes)=>{
        console.log("infos meshes: "+meshes);
        })
      .then((resultat)=>{
        console.log('ici : ' + resultat.meshes.length)
            gear = resultat.meshes[1];
            gear.material = matRouille;
            gear.scalingDeterminant = 0.15;
            gear.position.z = 3.6;
            gear.position.y = 0.15;
            gear.position.x = 3;
        })
    
    var tuyaux = getTuyaux(scene);

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
        let bon = verif(currentMesh.name);
        if (bon == true){
            console.log('OK');
            currentMesh.setEnabled(false);
            
        }
        console.log('bon : ' + bon)
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

function getTuyaux(scene) {
    var tuyau1 = [];
    var mats = [Color3.Black(), Color3.Green(), Color3.Red(), Color3.Blue(), Color3.Purple(), Color3.Gray(), Color3.Yellow(), Color3.White()]
    SceneLoader.ImportMeshAsync("tuyau","./models/", "tuyau.glb", scene, (meshes)=>{
        console.log("infos meshes: "+meshes);
        })
      .then((resultat)=>{
            tuyau1[0] = resultat.meshes[1];
            tuyau1[0].scalingDeterminant = 0.3;
            tuyau1[0].rotation = new Vector3(Math.PI / 2, Math.PI / 2, 0);
            tuyau1[0].position.z = -1;
            tuyau1[0].position.y = 1.7;
            tuyau1[0].position.x = 3;
            var mat = new StandardMaterial();
            mat.diffuseColor = mats[0];
            mat.backFaceCulling = false;
            tuyau1[0].material = mat;
            for (let i = 1; i < 8; i++){
                tuyau1[i] = tuyau1[0].clone('tuyau' + i);
                tuyau1[i].position.z = -1 + 0.25*i;
                tuyau1[i].position.y = (i%2 == 0) ? 1.7 : 1.4
                let mat = new StandardMaterial();
                mat.diffuseColor = mats[i];
                mat.backFaceCulling = false;
                tuyau1[i].material = mat;
            }

        })

        return tuyau1;    
}

const makeEngrenageVisible = (canvas) => {
    console.log("dans le canvas : " + canvas)

};

// deplacement du pointer : https://playground.babylonjs.com/#7CBW04

export { createScene, makeEngrenageVisible };