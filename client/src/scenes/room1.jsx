/* eslint-disable */
import { Texture, Mesh, Engine, Scene, SceneLoader, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight, PointerEventTypes, Color4 } from "@babylonjs/core";
import "@babylonjs/loaders";
import {ref} from "@vue/runtime-core";
import {getPorte, getTuyaux, getSalle, getTrappe, getEngrenageMoyen,getNavette} from "./roomsElements";


const position = ref("centre");

const createScene = (canvas, verif) => {
    //base pour creer la scene
    const engine = new Engine(canvas);
    const scene = new Scene(engine);

    //On ajoute une caméra et une lumière
    const camera = new FreeCamera("camera1", new Vector3(0, 1.6, -3), scene);
    camera.setTarget(new Vector3(0, 2, 5));
    camera.attachControl(canvas, false); ///TODO : blocker pour diminuer l'amplitude de mvt
    console.log(camera.position)

    new HemisphericLight("light", Vector3.Up(), scene);

    var mursSalle = getSalle(scene);
    var trappe = getTrappe(scene);

    var gear = getEngrenageMoyen(scene);
    var tuyaux = getTuyaux(scene);
    getPorte(scene);
    getNavette(scene);

    engine.runRenderLoop(() => {
        scene.render();
    });

    var currentMesh;

    var pointerDown = function (mesh) {
        currentMesh = mesh;
        console.log("Click")
        if (position.value === "centre"){
            let bon = verif(currentMesh.name);
            if (bon == true) {
                console.log('Engrenage retiré');
                currentMesh.setEnabled(false);
                currentMesh.position = new Vector3(4, 1.4, 1.3);
                currentMesh.rotation = new Vector3(0, 0, Math.PI/4);
                currentMesh.scalingDeterminant = 0.1;
            } else if(currentMesh.name.startsWith("tuyau")){
                moveCamera(camera, currentMesh,-1,1.6,0.125, -1);
            } else if(currentMesh.name === "trappe"){
                moveCamera(camera, currentMesh,2,0.2,1.5, 1);
            }
            console.log('bon : ' + bon)
        }
        else if (position.value === "enigme"){
            if(currentMesh.name === "allWalls"){
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

function moveCamera(camera, mesh, x, y, z, pos){
    position.value = "enigme";

    var target = new Vector3(x,y,z);
    camera.position = target;
    camera.setTarget(new Vector3(x+pos,y,z));
    camera.lockedTarget = new Vector3(x+pos,y,z);
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