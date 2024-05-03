/* eslint-disable */
import { Texture, Mesh, Engine, Scene, SceneLoader, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight, PointerEventTypes, Color4 } from "@babylonjs/core";
import "@babylonjs/loaders";
import {ref} from "@vue/runtime-core";
import {getPorte, getTuyaux, getSalle, getTrappe, getEngrenage, getNavette} from "./roomsElements";

//SAlle 1 : 
// position possible : centre, gauche (tuyau), droite (trappe)
const position = ref("centre");

const createScene = (canvas, verif) => {
    //base pour creer la scene
    const engine = new Engine(canvas);
    const scene = new Scene(engine);
    const drag = ref(null);

    //On ajoute une caméra et une lumière
    const camera = new FreeCamera("camera1", new Vector3(0, 1.6, -3), scene);
    camera.setTarget(new Vector3(0, 2, 5));
    camera.attachControl(canvas, false); ///TODO : blocker pour diminuer l'amplitude de mvt
    console.log(camera.position)

    new HemisphericLight("light", Vector3.Up(), scene);

    var mursSalle = getSalle(scene, 1);
    var trappe = getTrappe(scene);

    getEngrenage(scene, 'engrenageMoyen')
        .then(() => 
            scene.getMeshByName('engrenageMoyen').position = new Vector3(3, 0.15, 3.6)
        );

    var tuyaux = getTuyaux(scene);
    getPorte(scene);
    getNavette(scene);

    engine.runRenderLoop(() => {
        scene.render();
    });

    var pickPlane = MeshBuilder.CreatePlane("pickPlane", {size: 10});
    var mat = new StandardMaterial("MatpickPlane");
    mat.diffuseColor = Color3.Red();
    mat.backFaceCulling = false;
    pickPlane.material = mat;
    pickPlane.rotation = new Vector3(0, Math.PI/2,0);
    pickPlane.position.x = -4;
    pickPlane.isVisible = false;
    pickPlane.isPickable = true;

    var currentMesh;

    var getWallPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == pickPlane; });
        console.log(pickinfo.hit);
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

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
                moveCamera(camera, currentMesh,-1,1.6,0.125, -1);
            } else if(currentMesh.name === "trappe"){
                moveCamera(camera, currentMesh,2,0.2,1.5, 1);
            }
            console.log('bon : ' + bon)
        }
        else if (position.value === "gauche" ){
            if(currentMesh.name === "allWalls"){
                moveCameraInit(camera)
            }else if(currentMesh.name === "navettePleine"){
                drag.value = getWallPosition();
                console.log("Click sur navette pleine"+ drag.value)
            }

        }else if(position.value === "droite"){
            if(currentMesh.name === "allWalls"){
                moveCameraInit(camera)
            }
        }
    }

    var pointerUp = function(){
        if(drag.value){
            drag.value = null;
            console.log("Navette lachee");
        }
    }

    var pointerMove = function(){
        if(!drag.value){
            return;
        }
        var current = getWallPosition();
        if (!current) {
            return;
        }

        var diff = current.subtract(drag.value);
        currentMesh.position.addInPlace(diff);

        drag.value = current;

    }

    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                if (pointerInfo.pickInfo.hit) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                }
                break;
            case PointerEventTypes.POINTERUP:
                pointerUp();
                break;
            case PointerEventTypes.POINTERMOVE:
                pointerMove();
                break;
        }
    });

    return scene;
};

function moveCamera(camera, mesh, x, y, z, pos){
    if(pos === -1)
        position.value = "gauche";
    else
        position.value = "droite";

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
            let gear = scene.getMeshByName('engrenageMoyen');
            gear.setEnabled(true);
            scene.getMeshByName('engrenageMoyen').setEnabled(true);
            let tubeVide = scene.getMeshByName('navetteVide');
            let couvercle = scene.getMeshByName('navetteCouvercle');
            couvercle.position = new Vector3(4.35, 1.4, 1.3);
            let navettePleine = Mesh.MergeMeshes([gear, tubeVide, couvercle], true, false, null, false, true);
            navettePleine.name = 'navettePleine';
            return true
        }
    }
    return false
};

// deplacement du pointer : https://playground.babylonjs.com/#7CBW04

export { createScene, makeEngrenageVisible };