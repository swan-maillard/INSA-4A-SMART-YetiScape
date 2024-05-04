/* eslint-disable */
import { Texture, Mesh, Engine, Scene, SceneLoader, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight, PointerEventTypes, Color4 } from "@babylonjs/core";
import "@babylonjs/loaders";
import {ref} from "@vue/runtime-core";
import {getPorte, getSalle, getImportedMesh, getTuyau, getCoffre} from "./roomsElements";

//Salle 2 : 
//Position possible : centre, murDroite, tuyau, coffreRouage
const position = ref("centre");

const createScene = (canvas, verif) => {
    //base pour creer la scene
    const engine = new Engine(canvas);
    const scene = new Scene(engine);

    //On ajoute une caméra et une lumière
    const camera = new FreeCamera("camera1", new Vector3(0, 1.6, -3), scene);
    camera.setTarget(new Vector3(0, 2, 5));
    camera.attachControl(canvas, true); ///TODO : blocker pour diminuer l'amplitude de mvt

    new HemisphericLight("light", Vector3.Up(), scene);

    getSalle(scene, 2);
    getImportedMesh(scene, 'engrenageGrand', 'rouille.jpg')
        .then(()=> {
            scene.getMeshByName('engrenageGrand').position = new Vector3(-2.4, 0.15, 2.4);
            scene.getMeshByName('engrenageGrand').scalingDeterminant = 0.16;
            scene.getMeshByName('engrenageGrand').name = 'item:engrenageGrand';
        });
    getCoffre(scene)
    getImportedMesh(scene, 'engrenageMoyen', 'rouille.jpg')
        .then( () => {
            scene.getMeshByName('engrenageMoyen').position = new Vector3(2.4, 0.05, 4.2);
            scene.getMeshByName('engrenageMoyen').rotation = new Vector3(Math.PI / 2, 0, 0);
            scene.getMeshByName('engrenageMoyen').scalingDeterminant = 0.12;
            scene.getMeshByName('engrenageMoyen').name = 'engBas';
        });
    getImportedMesh(scene, 'engrenagePetit', 'rouille.jpg')
        .then( () => {
            scene.getMeshByName('engrenagePetit').position = new Vector3(2.45, 0.95, 4.2);
            scene.getMeshByName('engrenagePetit').rotation = new Vector3(Math.PI / 2, 0, 0);
            scene.getMeshByName('engrenagePetit').scalingDeterminant = 0.15;
            scene.getMeshByName('engrenagePetit').name = 'engHaut';
        });
    getImportedMesh(scene, 'engrenageGrand', 'rouille.jpg')
        .then( () => {
            scene.getMeshByName('engrenageGrand').position = new Vector3(2.53, 0.35, 4.2);
            scene.getMeshByName('engrenageGrand').rotation = new Vector3(Math.PI / 2, 0, 0);
            scene.getMeshByName('engrenageGrand').scalingDeterminant = 0.16;
            scene.getMeshByName('engrenageGrand').name = 'eng0';
        });
    getImportedMesh(scene, 'engrenageMoyen', 'rouille.jpg')
    .then( () => {
        scene.getMeshByName('engrenageMoyen').position = new Vector3(2.3, 0.7, 4.2);
        scene.getMeshByName('engrenageMoyen').rotation = new Vector3(Math.PI / 2, 0, 0);
        scene.getMeshByName('engrenageMoyen').scalingDeterminant = 0.15;
        scene.getMeshByName('engrenageMoyen').name = 'eng3';
    });
    getImportedMesh(scene, 'engrenagePetit', 'rouille.jpg')
    .then( () => {
        scene.getMeshByName('engrenagePetit').position = new Vector3(2.53, 0.61, 4.2);
        scene.getMeshByName('engrenagePetit').rotation = new Vector3(Math.PI / 2, 0, 0);
        scene.getMeshByName('engrenagePetit').scalingDeterminant = 0.1;
        scene.getMeshByName('engrenagePetit').name = 'eng4';
    });
    getImportedMesh(scene, 'engrenagePetit', 'rouille.jpg')
    .then( () => {
        scene.getMeshByName('engrenagePetit').position = new Vector3(2.26, 0.34, 4.2);
        scene.getMeshByName('engrenagePetit').rotation = new Vector3(Math.PI / 2, 0, 0);
        scene.getMeshByName('engrenagePetit').scalingDeterminant = 0.1;
        scene.getMeshByName('engrenagePetit').name = 'eng1';
    });
    getImportedMesh(scene, 'engrenagePetit', 'rouille.jpg')
    .then( () => {
        scene.getMeshByName('engrenagePetit').position = new Vector3(2.16, 0.48, 4.2);
        scene.getMeshByName('engrenagePetit').rotation = new Vector3(Math.PI / 2, 0, 0);
        scene.getMeshByName('engrenagePetit').scalingDeterminant = 0.1;
        scene.getMeshByName('engrenagePetit').name = 'eng2';
    });
    
    getPorte(scene);
    getTuyau(scene);

    engine.runRenderLoop(() => {
        scene.render();
    });

    var currentMesh;

    var pointerDown = function (mesh) {
        currentMesh = mesh;
        if(currentMesh.name.startsWith('item')){
            verif('item', currentMesh.name.substring(5))
            .then(() => {
                console.log("promesse tenue : on supprime l'engrenage")
                currentMesh.dispose();
            })
            .catch(() => {
                console.log('promesse non tenue, on garde l engrenage')
            });
        }
        if (position.value === 'centre') {
            if (currentMesh.name === 'coffreRouage') {
                moveCamera(camera, currentMesh, -1,1.6,0.125, -1);
            }
        }
        if (position.value !== "centre" && currentMesh.name === "allWalls") {
            console.log("Retour position départ")
            moveCameraInit(camera)
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
    position.value = 'coffreRouage'

    var target = new Vector3(-2.4, 0.8, 2);
    camera.position = target;
    camera.setTarget(new Vector3(-2.4, 0.8, 4.2));
    camera.lockedTarget = new Vector3(-2.4, 0.8, 4.2);
}

function moveCameraInit(camera){
    position.value = "centre";

    camera.position = new Vector3(0, 1.6, -3);
    camera.setTarget(new Vector3(0,1.6,0))
    camera.lockedTarget = null;
}

const placeItem = (scene, item) => {
    if (position.value === "coffreRouage") {
        if (item === 'engrenageGrand'){
            getImportedMesh(scene, 'engrenageGrand', 'rouille.jpg').then(() => {
                let gear = scene.getMeshByName('engrenageGrand')
                gear.position = new Vector3(1, 1, 1);
                gear.rotation = new Vector3(0, 0, 0);
                gear.scalingDeterminant = 0.1;
            });
            return position.value;
        }
    }
    return 'erreur';
};

// deplacement du pointer : https://playground.babylonjs.com/#7CBW04

export { createScene, placeItem };