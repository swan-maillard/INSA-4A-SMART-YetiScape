/* eslint-disable */
import { Texture, Mesh, Engine, Scene, SceneLoader, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight, PointerEventTypes, Color4 } from "@babylonjs/core";
import "@babylonjs/loaders";
import {ref} from "@vue/runtime-core";
import {getPorte, getTuyaux, getSalle, getTrappe, getEngrenage, getNavette} from "./roomsElements";

//Salle 2 : 
//Position possible : centre, droite, gauche, coffre
const position = ref("centre");

const createScene = (canvas, verif) => {
    //base pour creer la scene
    const engine = new Engine(canvas);
    const scene = new Scene(engine);

    //On ajoute une caméra et une lumière
    const camera = new FreeCamera("camera1", new Vector3(0, 1.6, -3), scene);
    camera.setTarget(new Vector3(0, 2, 5));
    camera.attachControl(canvas, true); ///TODO : blocker pour diminuer l'amplitude de mvt
    console.log(camera.position)

    new HemisphericLight("light", Vector3.Up(), scene);

    var mursSalle = getSalle(scene, 2);
    var gear = getEngrenage(scene, 'engrenageGrand');
    gear.position = new Vector3(-2.4, 0.15, 2.4);
    getPorte(scene);

    engine.runRenderLoop(() => {
        scene.render();
    });

    var currentMesh;

    var pointerDown = function (mesh) {
        currentMesh = mesh;
        if (position.value === "centre"){
            let bon = verif(currentMesh.name);
            if (bon == true) {
                console.log('Engrenage retiré');
                currentMesh.setEnabled(false);
                currentMesh.position = new Vector3(4, 1.4, 1.3);
                currentMesh.rotation = new Vector3(0, 0, Math.PI/4);
                currentMesh.scalingDeterminant = 0.1;
            } else if(currentMesh.name.startsWith("tuyau")){
                console.log('Un tuyau a été cliqué !!!!!')
                moveCamera(camera, currentMesh);
            }
            console.log('bon : ' + bon)
        }
        else if (position.value === "gauche"){
            if(currentMesh.name === "allWalls"){
                console.log("Retour position départ")
                moveCameraInit(camera)
            }
        }
    }

    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                if (pointerInfo.pickInfo.hit) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                }
                break;
            case PointerEventTypes.POINTERUP:
                break;
        }
    });

    return scene;
};

function moveCamera(camera, mesh){
    position.value = "gauche";

    camera.position = new Vector3(-0.5,1.6,0);
    var target = new Vector3(-mesh.position.x, 1.6, mesh.position.z);
    camera.setTarget(target);
    camera.lockedTarget = mesh;
}

function moveCameraInit(camera){
    position.value = "centre";

    camera.position = new Vector3(0, 1.6, -3);
    camera.setTarget(new Vector3(0,1.6,0))
    camera.lockedTarget = null;
}
const makeEngrenageVisible = (scene, item) => {
    if (position.value === "gauche") {
        if (item === 'engrenageMoyen'){
            scene.getMeshByName('engrenageMoyen').setEnabled(true);
            return true
        }
    }
    return false
};

// deplacement du pointer : https://playground.babylonjs.com/#7CBW04

export { createScene, makeEngrenageVisible };