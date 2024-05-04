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
    getImportedMesh(scene, 'engrenagePetit', 'rouille.jpg')
    .then( () => {
        let eng1 = scene.getMeshByName('engrenagePetit');
        eng1.position = new Vector3(2.1, 0.12, 4.1);
        eng1.setPivotPoint = new Vector3(2.1, 0.12, 4.1);
        eng1.scalingDeterminant = 0.1;
        eng1.name = 'dragEngP1';
        let eng2 = eng1.clone('dragEngP2');
        eng2.position = new Vector3(2.4, 0.12, 4)
        let eng3 = eng1.clone('dragEngP3');
        eng3.position = new Vector3(2.65, 0.12, 4.1)
    });

    var pickPlane = MeshBuilder.CreatePlane("pickPlane", {size: 2});
    pickPlane.isVisible = false;
    pickPlane.position= new Vector3(-2, 1, 3.8);
    pickPlane.isPickable = true;
    
    getPorte(scene);
    getTuyau(scene);

    engine.runRenderLoop(() => {
        scene.render();
    });

    var currentMesh;
    var dragOrigin = null;

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
        } else if (position.value === 'coffreRouage'){
            if (currentMesh.name.startsWith('dragEng')){
                console.log(currentMesh.position);
                dragOrigin = new Vector3 (currentMesh.position.x, currentMesh.position.y, currentMesh.position.z);
                console.log(dragOrigin);
                currentMesh.rotation = new Vector3(Math.PI/2,0, 0);
            }
        }
        if (position.value !== "centre" && currentMesh.name === "allWalls") {
            console.log("Retour position départ")
            moveCameraInit(camera)
        }
    }

    var pointerUp = function(pointerInfo){
        if(dragOrigin){
            console.log('here2 ' + pointerInfo.pickInfo.pickedMesh.name);
            if (pointerInfo.pickInfo.pickedMesh.name.startsWith('cyl')){
                currentMesh.position.x = - pointerInfo.pickInfo.pickedMesh.position.x;
                currentMesh.position.z = pointerInfo.pickInfo.pickedMesh.position.z;
                currentMesh.position.y = pointerInfo.pickInfo.pickedMesh.position.y;
            } else {
                currentMesh.rotation = new Vector3(0, 0, 0);
                currentMesh.position = dragOrigin;
            }
            //verifier qu'un cylindre est touché.
            //Si oui, poser l'eng dessus
            //Sinon, remettre dans sa position et rotation d'origine
            dragOrigin = null;   
        }
    }

    var pointerMove = function(){
        if(!dragOrigin){
            return;
        }
        var current = getWallPosition();
        if (!current) {
            return;
        }
        currentMesh.position.x = - current.x;
        currentMesh.position.y = current.y;
        currentMesh.position.z = current.z;
    }

    var getWallPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == pickPlane; });
        console.log(pickinfo.hit);
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }
        return null;
    }

    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                if (pointerInfo.pickInfo.hit) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                }
                break;
            case PointerEventTypes.POINTERUP:
                pointerUp(pointerInfo);
                break;
            case PointerEventTypes.POINTERMOVE:
                pointerMove();
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
            getImportedMesh(scene, 'engrenageGrand', 'rouille.jpg')
                .then( () => {
                    scene.getMeshByName('engrenageGrand').position = new Vector3(2.9, 0.1, 3.8);
                    scene.getMeshByName('engrenageGrand').scalingDeterminant = 0.16;
                    scene.getMeshByName('engrenageGrand').name = 'dragEngG0';
                });
        }
        if (item === 'engrenageMoyen'){
            getImportedMesh(scene, 'engrenageMoyen', 'rouille.jpg')
                .then( () => {
                    scene.getMeshByName('engrenageMoyen').position = new Vector3(2, 0.1, 3.8);
                    scene.getMeshByName('engrenageMoyen').scalingDeterminant = 0.15;
                    scene.getMeshByName('engrenageMoyen').name = 'dragEngM3';
                });
        }
        return position.value;
    }
    return 'erreur';
};

// deplacement du pointer : https://playground.babylonjs.com/#7CBW04

export { createScene, placeItem };