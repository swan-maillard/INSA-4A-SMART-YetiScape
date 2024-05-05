/* eslint-disable */
import { Texture, Mesh, Engine, Scene, SceneLoader,  FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight, PointerEventTypes, Color4 } from "@babylonjs/core";
import "@babylonjs/loaders";
import {ref, computed, watchEffect} from "@vue/runtime-core";
import {getPorte, getTuyaux, getSalle, getTrappe, getImportedMesh, getNavette, getGemme} from "./roomsElements";
import useAuth from "../stores/auth.store";
import useApi from "../stores/api.store";

//SAlle 1 : 
// position possible : centre, tuyau (gauche), trappe (gauche)
const position = ref("centre");

const createScene = (canvas) => {
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

    new HemisphericLight("light", Vector3.Up(), scene);

    //scene de base
    var mursSalle = getSalle(scene, 1);
    var trappe = getTrappe(scene);
    var tuyaux = getTuyaux(scene);
    getPorte(scene);

    var pickPlane = MeshBuilder.CreatePlane("pickPlane", {size: 10});
    pickPlane.isVisible = false;
    pickPlane.rotation = new Vector3(0, Math.PI/2,0);
    pickPlane.position.x = -3.5;
    //Fin scene de base

    // Elements reactifs de la scene
    const game = computed(() => useAuth().game);
    console.log(game.value)
    if (game.value.itemsDispo.length > 0){
        placeEngInit(scene);
    }
    if( game.value.tuyau.etapeActuelle != game.value.tuyau.nbEtapes){
        getNavette(scene).then(()=>{
            if(game.value.tuyau.items.length > 0){
                console.log( game.value.tuyau.items[0])
                putItemInNavette(scene, game.value.tuyau.items[0]);
            }
        });
    }
    
    game.value.trappe.items.forEach(element => {
        putItemFromTrappe(scene, element)
    });
    if( game.value.trappe.etapeActuelle == game.value.trappe.nbEtapes){
        deleteTrappe(scene);
    }
   
    engine.runRenderLoop(() => {
        scene.render();
    });

    //Interaction inputs
    var currentMesh
    var getWallPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == pickPlane; });
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
                tuyauTouche = i;
                break;
            }
            tuyauPick.isPickable = false;
        }
        pickPlane.isPickable = true;
        return tuyauTouche;
    }

    var setOldPosition = function(){
        currentMesh.position = new Vector3(0, 0, 0);
    }

    var pointerDown = function (mesh) {
        currentMesh = mesh;
        if(currentMesh.name.startsWith('item')){
            useApi().post('/game/pick-item', {item: currentMesh.name.split(':')[1]})
                .then(res => {
                    const data = res.data;
                    if (data.status === 'ok') {
                        useAuth().user = data.user;
                        useAuth().game.itemsDispo = data.game.itemsDispo;
                    }
                    currentMesh.dispose();
                })
                .catch(console.log);
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
            let tuyauTouche = getTuyauxPicked(); 
            if (tuyauTouche === -1) {
                setOldPosition();
            } else {
                useApi().post('/game/tuyau/envoi', {trou: tuyauTouche})
                .then(res => {
                    const data = res.data;
                        useAuth().user = data.user;
                        useAuth().game.tuyau = data.game.tuyau; //TODO: MAJ inventaire
                        deleteNavette(scene);
                    if (data.status === 'no') {
                        getNavette(scene);                        
                    }
                })
                .catch();
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

function placeEngInit(scene){
    getImportedMesh(scene, 'engrenageMoyen', 'rouille.jpg')
        .then(() => {
            scene.getMeshByName('engrenageMoyen').position = new Vector3(3, 0.15, 3.6);
            scene.getMeshByName('engrenageMoyen').scalingDeterminant = 0.15;
            scene.getMeshByName('engrenageMoyen').name = 'item:engrenageMoyen';
        });
}

function verifItemInNavette(scene, nomItem){
    if(position.value === "tuyau"){
        useApi().post('/game/tuyau/put-item', {item: nomItem})
                .then(res => {
                    const data = res.data;
                    useAuth().user = data.user;
                    useAuth().game.tuyau = data.game.tuyau;
                    if (data.status === 'ok') {
                        putItemInNavette(scene,nomItem)
                    }
                })
                .catch(console.log);
    }
    
}

function putItemInNavette(scene, nomItem){
    if (nomItem === 'engrenageMoyen'){
        getImportedMesh(scene, 'engrenageMoyen', 'rouille.jpg').then(() => {
            placeItemInNavette(scene, nomItem, 0.1);
        })
    } else if (nomItem.startsWith('gemme')) {
        getGemme(scene, nomItem.substring(5)).then(() => {
            placeItemInNavette(scene, nomItem);
        })
    }
}

function placeItemInNavette(scene, item, scale = 1){
    let itemMesh = scene.getMeshByName(item)
    itemMesh.position = new Vector3(4, 1.4, 1.3);
    itemMesh.rotation = new Vector3(0, 0, Math.PI/4);
    itemMesh.scalingDeterminant = scale;
    let tubeVide = scene.getMeshByName('navetteVide');
    let couvercle = scene.getMeshByName('navetteCouvercle');
    couvercle.position = new Vector3(4.35, 1.4, 1.3);
    let navettePleine = Mesh.MergeMeshes([itemMesh, tubeVide, couvercle], true, false, null, false, true);
    navettePleine.setPivotPoint(new Vector3(4.3, 1.4, 1.3));
    navettePleine.name = 'navettePleine';
    return itemMesh;
}

function deleteNavette(scene){
    console.log("prout")
    let navette = scene.getMeshByName('navettePleine');
    if (navette == null) {
        console.log("loulou")
        navette = scene.getMeshByName('navetteVide');
        if (navette !=  null){
            console.log("patate")
            navette.dispose();
            scene.getMeshByName('navetteCouvercle').dispose();
        }
    } else {
        navette.dispose();
    }
}

function deleteTrappe(scene){
    let trappe = scene.getMeshByName('trappe')
    if (trappe) {
        trappe.dispose();
    }
}

function putItemFromTrappe(scene, item){
    if (item.startsWith('gemme')) {
        getGemme(scene, item.substring(5)).then(() => {
            placeItemFromTrappe(scene, item);
        })
    }
}

function placeItemFromTrappe(scene, item){
    let itemMesh = scene.getMeshByName(item)
    itemMesh.position = new Vector3(4.65, 0.2, 1.5);
    itemMesh.name = 'item:' + item;
    return itemMesh;
}

// deplacement du pointer : https://playground.babylonjs.com/#7CBW04

export { verifItemInNavette, createScene, placeEngInit, deleteNavette, deleteTrappe, putItemFromTrappe };