/* eslint-disable */
import { Texture, Mesh, Engine, Scene, SceneLoader, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight, PointerEventTypes, Color4 } from "@babylonjs/core";
import "@babylonjs/loaders";
import {ref} from "@vue/runtime-core";
import {getPorte, getSalle, getImportedMesh, getTuyau, getCoffreRouage, getGemme} from "./roomsElements";

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
    getCoffreRouage(scene)
    getImportedMesh(scene, 'engrenagePetit', 'rouille.jpg')
    .then( () => {
        let eng1 = scene.getMeshByName('engrenagePetit');
        eng1.position = new Vector3(2.1, 0.12, 4.1);
        eng1.setPivotPoint = new Vector3(2.1, 0.12, 4.1);
        eng1.scalingDeterminant = 0.1;
        eng1.name = 'dragEngP1||2.1,0.12,4.1';
        let eng2 = eng1.clone('dragEngP2||2.4,0.12,4');
        eng2.position = new Vector3(2.4, 0.12, 4);
        let eng3 = eng1.clone('dragEngP3||2.65,0.12,4.1');
        eng3.position = new Vector3(2.65, 0.12, 4.1);
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
    var drag = false;

    var pointerDown = function (mesh) {
        currentMesh = mesh;
        console.log('click sur ' + currentMesh.name)
        console.log('texture : ' + scene.getMaterialByName('rouille.j'));
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
                drag = true;
                currentMesh.rotation = new Vector3(Math.PI/2,0, 0);
            } else if (currentMesh.name === 'engBas'){
                let bon = verifRouage(scene);
                console.log('verification du puzzle : ' + bon);
                if (bon === true) {
                    verif(position.value, true).then(() => {
                        getGemme(scene, 'ronde').then(() => {
                            scene.getMeshByName('gemmeRonde').rotation = new Vector3(Math.PI/4, Math.PI/4, 0);
                            scene.getMeshByName('gemmeRonde').position = new Vector3(2.45, 1.05, 4.2);
                            scene.getMeshByName('gemmeRonde').name = 'item:gemmeRonde';
                        })
                    });
                }
            }
        }
        if (position.value !== "centre" && currentMesh.name === "allWalls") {
            console.log("Retour position départ")
            moveCameraInit(camera)
        }
    }

    var replaceEngInit = function(currentMesh, forceOrigin) {
        let engComps = currentMesh.name.split('|');
        let pos = [];
        if (forceOrigin || engComps[1] === ""){
            currentMesh.rotation = new Vector3(0, 0, 0);
            pos = engComps[2].split(',');
            if (engComps[1] !== ""){
                console.log('ici')
                let cyl = scene.getMeshByName(engComps[1] + '|' + engComps[0]);
                let cylComps = cyl.name.split('|');
                cyl.name = cylComps[0] + '|';
                engComps[1] = '';
                currentMesh.name = engComps.join('|');
            }
        } else {
            console.log('ici2')
            let cyl = scene.getMeshByName(engComps[1] + '|' + engComps[0]);
            pos[0] = - cyl.position.x;
            pos[1] = cyl.position.y;
            pos[2] = cyl.position.z;
        }
        currentMesh.position = new Vector3(...pos);
    }

    var pointerUp = function(pickedMesh){
        if(drag){
            if (pickedMesh.name.startsWith('cyl')){ // j'ai fini sur un cyl
                if (pickedMesh.name.endsWith('|')){ // le cyl est dispo
                    let engComps = currentMesh.name.split('|');
                    let cylComps = pickedMesh.name.split('|');
                    if (engComps[1] !== ""){
                        console.log('crach ici')
                        console.log('cherche : ' + engComps[1] + '|' + engComps[0])
                        scene.getMeshByName(engComps[1] + '|' + engComps[0]).name = engComps[1] + '|';
                    }
                    engComps[1] = cylComps[0];
                    cylComps[1] = engComps[0];
                    currentMesh.name = engComps.join('|');
                    pickedMesh.name = cylComps.join('|');
                    currentMesh.position.x = - pickedMesh.position.x;
                    currentMesh.position.z = pickedMesh.position.z;
                    currentMesh.position.y = pickedMesh.position.y;
                } else {
                    replaceEngInit(currentMesh, false);
                }
            } else {
                replaceEngInit(currentMesh, true);
            }
            //verifier qu'un cylindre est touché.
            //Si oui, poser l'eng dessus
            //Sinon, remettre dans sa position et rotation d'origine
            drag = null;   
        }
    }

    var pointerMove = function(){
        if(!drag){
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
                pointerUp(pointerInfo.pickInfo.pickedMesh);
                break;
            case PointerEventTypes.POINTERMOVE:
                pointerMove();
                break;
        }
    });

    function verifRouage(scene){
        let count = 0;
        if (scene.getMeshByName('dragEngP1||2.1,0.12,4.1')) {
            count++;
        }
        if (scene.getMeshByName('dragEngP2||2.4,0.12,4')) {
            count++;
        }
        if (scene.getMeshByName('dragEngP3||2.65,0.12,4.1')) {
            count++;
        }
        if (count == 1
            && scene.getMeshByName('cyl4|dragEngP3') == null 
            && scene.getMeshByName('cyl4|dragEngP2') == null 
            && scene.getMeshByName('cyl4|dragEngP1') == null
            && scene.getMeshByName('cyl0|dragEngG') != null
            /*&& scene.getMeshByName('cyl3|dragEngM') != null*/)
            return true;
        return false;
    }

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
                    scene.getMeshByName('engrenageGrand').name = 'dragEngG||2.9,0.1,3.8';
                });
                return position.value;
        }
        if (item === 'engrenageMoyen'){
            getImportedMesh(scene, 'engrenageMoyen', 'rouille.jpg')
                .then( () => {
                    scene.getMeshByName('engrenageMoyen').position = new Vector3(2, 0.1, 3.8);
                    scene.getMeshByName('engrenageMoyen').scalingDeterminant = 0.15;
                    scene.getMeshByName('engrenageMoyen').name = 'dragEngM||2,0.1,3.8';
                });
            return position.value;
        }
    }
    return 'erreur';
};

// deplacement du pointer : https://playground.babylonjs.com/#7CBW04

export { createScene, placeItem };