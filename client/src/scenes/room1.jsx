/* eslint-disable */
import { Texture, Mesh, Engine, Scene, SceneLoader,  FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight, PointerEventTypes, Color4 } from "@babylonjs/core";
import "@babylonjs/loaders";
import {ref} from "@vue/runtime-core";
import {getPorte, getTuyaux, getSalle, getTrappe, getImportedMesh, getNavette} from "./roomsElements";

//SAlle 1 : 
// position possible : centre, tuyau (gauche), trappe (gauche)
const position = ref("centre");

const createScene = (canvas, verif) => {
    //base pour creer la scene
    const engine = new Engine(canvas);
    const scene = new Scene(engine);
    const drag = ref(null);

    //On ajoute une caméra et une lumière
    const camera = new FreeCamera("camera1", new Vector3(0, 1.6, -3), scene);
    camera.setTarget(new Vector3(0, 2, 5));
    camera.inputs.clear();
    camera.inputs.addMouse();
    camera.attachControl(canvas, false); ///TODO : blocker pour diminuer l'amplitude de mvt
    console.log(camera.position)

    new HemisphericLight("light", Vector3.Up(), scene);

    var mursSalle = getSalle(scene, 1);
    var trappe = getTrappe(scene);

    getImportedMesh(scene, 'engrenageMoyen', 'rouille.jpg')
        .then(() => {
            scene.getMeshByName('engrenageMoyen').position = new Vector3(3, 0.15, 3.6);
            scene.getMeshByName('engrenageMoyen').scalingDeterminant = 0.15;
            scene.getMeshByName('engrenageMoyen').name = 'item:engrenageMoyen';
        });

    var tuyaux = getTuyaux(scene);
    getPorte(scene);
    getNavette(scene);

    engine.runRenderLoop(() => {
        scene.render();
    });

    var pickPlane = MeshBuilder.CreatePlane("pickPlane", {size: 10});
    pickPlane.isVisible = false;
    pickPlane.rotation = new Vector3(0, Math.PI/2,0);
    pickPlane.position.x = -3.5;
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

    var getTuyauxPicked = function() {
        pickPlane.isPickable = false;
        let tuyauTouche = -1;
        for(var i=0; i<8; i++){
            var tuyauPick = scene.getMeshByName("tuyau"+i);
            tuyauPick.isPickable = true;
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == tuyauPick; });
            if(pickinfo.hit){
                console.log("Hit !!!!!!" + i);
                tuyauTouche = i;
                //On delete la navette de la scene (mesh.dispose)
                break;
            }
            tuyauPick.isPickable = false;
        }
        pickPlane.isPickable = true;
        return tuyauTouche;
        //si rien de touché : on remet la navette a sa place : Vector3(-4.1, 1.4, 1.3);
        //si qqch de touché, on lance la vérif =>
            // verif OK : rien
            // verif non OK : remettre le tube vide a sa place (getNavette)
    }

    var setInvisible = function(){
        currentMesh.isVisible = false;
    }

    var setOldPosition = function(){
        currentMesh.position = new Vector3(0, 0, 0);
    }

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
        if (position.value === "centre"){
             if(currentMesh.name.startsWith("tuyau")){
                moveCamera(camera, currentMesh,-1,1.6,0.125, -1);
            } else if(currentMesh.name === "trappe"){
                moveCamera(camera, currentMesh,2,0.2,1.5, 1);
            }
        }
        else if(position.value === "tuyau" ){
            if(currentMesh.name === "allWalls"){
                moveCameraInit(camera)
            } else if(currentMesh.name === "navettePleine"){

                currentMesh.position.addInPlace(new Vector3(0.5, 0, -0.1));
                drag.value = getWallPosition();
                console.log("Click sur navette pleine "+ drag.value)
            }

        } else if(position.value === "trappe"){
            if(currentMesh.name === "allWalls"){
                moveCameraInit(camera)
            }
        }
    }

    var pointerUp = function(){
        if(drag.value){
            drag.value = null;
            console.log("Navette lachee");
            let tuyauTouche = getTuyauxPicked(); 
            if (tuyauTouche === -1) {
                setOldPosition();
            } else {
                currentMesh.dispose();
                verif('tuyau', tuyauTouche).then(()=>{
                    console.log('OK pour le tuyau');
                })
                .catch(() => {
                    console.log('Not OK, ca reviens');
                    getNavette(scene);
                }) 
            }        
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
        console.log("Current:" + current)
        currentMesh.position.x = current.x + 4;
        currentMesh.position.y = current.y - 1.4;
        currentMesh.position.z = current.z * 0.9 - 1.3;

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
        position.value = "tuyau";
    else
        position.value = "trappe";

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

const placeItem = (scene, item) => {
    if (position.value === "tuyau") {
        if (item === 'engrenageMoyen'){
            getImportedMesh(scene, 'engrenageMoyen', 'rouille.jpg').then(() => {
                let gear = scene.getMeshByName('engrenageMoyen')
                gear.position = new Vector3(4, 1.4, 1.3);
                gear.rotation = new Vector3(0, 0, Math.PI/4);
                gear.scalingDeterminant = 0.1;
                let tubeVide = scene.getMeshByName('navetteVide');
                let couvercle = scene.getMeshByName('navetteCouvercle');
                couvercle.position = new Vector3(4.35, 1.4, 1.3);
                let navettePleine = Mesh.MergeMeshes([gear, tubeVide, couvercle], true, false, null, false, true);
                navettePleine.setPivotPoint(new Vector3(4.3, 1.4, 1.3));
                navettePleine.name = 'navettePleine';

            });
            return position.value;
        }
    }
    return 'erreur';
};

// deplacement du pointer : https://playground.babylonjs.com/#7CBW04

export { createScene, placeItem };