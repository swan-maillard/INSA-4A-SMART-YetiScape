/* eslint-disable */
import {PointerEventTypes, Engine, Scene, FreeCamera, Vector3, HemisphericLight, Texture, DynamicTexture, StandardMaterial, MeshBuilder, Color3} from "@babylonjs/core";
import {ref, computed, watchEffect} from "@vue/runtime-core";
import {getPorte, getGemme,  getSalle, getCoffreGemmes, getCodeCoffre, getButtonValdier, getTrappeGauche} from "./roomsElements";
import useAuth from "../stores/auth.store";
import useApi from "../stores/api.store";

//Salle 3 : 
// position possible : centre, trappe, image, coffre, textes
const position = ref("centre");

const createScene = (canvas, verif) => {
    //base pour creer la scene
    const engine = new Engine(canvas);
    const scene = new Scene(engine);
    
    //On ajoute une caméra et une lumière
    const camera = new FreeCamera("camera1", new Vector3(0, 1.6, -3), scene);
    camera.setTarget(new Vector3(0, 2, 5));
    camera.inputs.clear();
    camera.inputs.addMouse();
    camera.attachControl(canvas, false); 
    console.log(camera.position)

    new HemisphericLight("light", Vector3.Up(), scene);

    var mursSalle = getSalle(scene, 3);
    getPorte(scene);

    var textePlane = MeshBuilder.CreatePlane('textePlane', {width:2, height:1.2});
    let textTexte = new Texture("./img/textes.png", scene);
    let matTextes = new StandardMaterial("matTextes");
    matTextes.diffuseTexture = textTexte;
    matTextes.diffuseTexture.hasAlpha = true;
    textePlane.material = matTextes;
    textePlane.rotation = new Vector3(0, - Math.PI / 2, 0);
    textePlane.position = new Vector3(-4.7, 1.6, 0);

    // Load scene de base 
    const matBlanc = new StandardMaterial("matBlanc", scene);
    matBlanc.diffuseColor = Color3.White();

    const matNoir = new StandardMaterial("matNoir", scene);
    matNoir.diffuseColor = Color3.Black();

    const forme = ref([])
    for(var i=0; i<15;i++){forme.value.push(0)}
    // Creation code coffre
    const code = ref([0,0,0,0]); // valeur de la combinaison du coffre

    var texture = new Array();
    for(var i=0; i<4; i++){
        texture.push(getCodeCoffre(scene,i,3.5-i*0.3));
    }
    getButtonValdier();
    

    // Elements reactifs de la scene
    const game = computed(() => useAuth().game);
    console.log(game.value)
    if(game.value.trappe.etapeActuelle != game.value.trappe.nbEtapes){
        getTrappeGauche(scene);
    }else{
        var cercle = MeshBuilder.CreateCylinder("objetTrappe",{diameter:0.5, height:0.001}, scene);
        cercle.position = new Vector3(-4.5,0,1.5);
        game.value.trappe.items.forEach((element) => {
            placeItem(scene, element)
        });
    }
    getCoffreGemmes(scene).then(()=>{
        if(game.value.coffre.etapeActuelle == game.value.coffre.nbEtapes){
            openCoffre();
            game.value.itemsDispo.forEach(e => {
                placeCoffre(e);
            });
        }  
    });
      

    //TODO: pour Swan lorsque l'objet a été gemme a été recupéré de l'autre côté, le faire disparaitre, pour cela faire :
    // scene.getMeshByName("gemmeTriangle").dispose();


    engine.runRenderLoop(() => {
        scene.render();
    });

    var currentMesh;

    var pointerDown = function (mesh) {
        currentMesh = mesh;
        console.log("click sur " + currentMesh.name)
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
        if(position.value === "centre"){
            if(currentMesh.name.startsWith("wooden_crate")){
                var coffre = scene.getMeshByName("wooden_crate_01_latch")
                if(coffre.isVisible){
                    moveCamera(camera, 1,new Vector3(0.5,1.6,3), new Vector3(5.3,0,3) );
                }else{
                    moveCamera(camera, 1,new Vector3(3,1.6,3), new Vector3(5.3,0,3) );
                }
                
            }else if(currentMesh.name === "trappe" || currentMesh.name.startsWith("cercle")){
                moveCamera(camera,-1,new Vector3(-2,0.2,1.5), new Vector3(-3,0.2,1.5))
            }else if(currentMesh.name === "objetTrappe"){
                moveCamera(camera,-1,new Vector3(-2,1.6,1.5), new Vector3(-5,0,1.5))
            }
            else if(currentMesh.name === 'textePlane') {
                moveCamera(camera, 0,new Vector3(-3,1.6,0), new Vector3(-5.7,1.6,0))
            }
        }
        else if(position.value === "coffre"){
            if(currentMesh.name.startsWith("add")){
                addNumberCode();
            }
            else if(currentMesh.name.startsWith("sub")){
                subNumberCode();
            }
            else if(currentMesh.name === "buttonValider"){
                var codeAssemble = "";
                code.value.forEach((e) => {
                    codeAssemble += e;
                });
                useApi().post('/game/coffre/solve', {code: codeAssemble})
                .then(res => {
                    const data = res.data;
                        useAuth().user = data.user;
                        useAuth().game.itemsDispo = data.game.itemsDispo;
                        useAuth().game.coffre = data.game.coffre;
                    if (data.status === 'ok') {
                        console.log("Vous avez ouvert le coffre !")
                        openCoffre();
                        game.value.itemsDispo.forEach(e => {
                            placeCoffre(e);
                        });
                        moveCamera(camera, 1,new Vector3(3,1.6,3), new Vector3(5.3,0,3) );
                    }else if(data.status === 'no'){
                        console.log("Mauvais code ...");
                        reinitCode();
                    }
                })
                .catch(console.log);
            }else if(currentMesh.name === "allWalls"){
                moveCameraInit(camera)
            }
        }else if(position.value === "trappe"){
            if(currentMesh.name === "allWalls"){
                moveCameraInit(camera)
            }
            else if(currentMesh.name.startsWith("cercle")){
                changeColorCircle();
                var configurationAssemble = "";
                forme.value.forEach((e) => {
                    configurationAssemble += e;
                });
                useApi().post('/game/trappe/solve', {configuration: configurationAssemble})
                .then(res => {
                    const data = res.data;
                        useAuth().user = data.user;
                        useAuth().game.trappe = data.game.trappe;
                    if (data.status === 'ok') {
                        console.log("Vous avez ouvert la trappe !")
                        openTrappe();
                    }else if(data.status === 'no'){
                        console.log("Mauvaise forme ...");
                    }
                })
                .catch(console.log);
            }
        }else{
            if(currentMesh.name === "allWalls"){
                moveCameraInit(camera)
            }
        }
        
    }

    var openCoffre = function(){
        var cordeCoffre = scene.getMeshByName("wooden_crate_01_latch");
        cordeCoffre.isVisible = false;
        var hautCoffre = scene.getMeshByName("wooden_crate_01_lid");
        hautCoffre.isVisible = false;        
    }

    var placeCoffre = function(nom){
        if(nom == "gemmeTriangle"){
            getGemme(scene, 'triangle').then(() => {
                scene.getMeshByName('gemmeTriangle').rotation = new Vector3(Math.PI/4, Math.PI/4, 0);
                scene.getMeshByName('gemmeTriangle').position = new Vector3(-4.3, 0.2, 3);
                scene.getMeshByName('gemmeTriangle').name = 'item:gemmeTriangle';
            })
        }else if(nom == "gemmeCarre"){
            getGemme(scene, 'carre').then(() => {
                scene.getMeshByName('gemmeCarre').rotation = new Vector3(Math.PI/4, Math.PI/4, 0);
                scene.getMeshByName('gemmeCarre').position = new Vector3(-4.3, 0.2, 3);
                scene.getMeshByName('gemmeCarre').name = 'item:gemmeCarre';
            })
        }
        
    }

    var openTrappe = function(){
        var trappe = scene.getMeshByName("trappe");
        trappe.isVisible = false;
        for(var i=0; i<15; i++){
            var cercle = scene.getMeshByName("cercle:"+i);
            cercle.isVisible = false;
        }      
           
        var cercle = MeshBuilder.CreateCylinder("objetTrappe",{diameter:0.5, height:0.001}, scene);
        cercle.position = new Vector3(-4.5,0,1.5);
        moveCameraInit(camera);
    }

    var reinitCode = function(){
        for(var i=0; i<4; i++){
            code.value[i] = 0;
            texture[i].drawText(code.value[i], 35,70,"bold 50px Arial", "white", "black", true)
        }
    }

    var subNumberCode = function(){
        var index = currentMesh.name.split(':')[1];
        if(code.value[index]>0)
            code.value[index]--;
        else
            code.value[index] = 9;
        texture[index].drawText(code.value[index], 35,70,"bold 50px Arial", "white", "black", true);
        texture[index].update();
    }

    var addNumberCode = function(){
        var index = currentMesh.name.split(':')[1];
        if(code.value[index]<9)
            code.value[index]++;
        else
            code.value[index] = 0;
        texture[index].drawText(code.value[index], 35,70,"bold 50px Arial", "white", "black", true);
        texture[index].update();
    }
    
    var changeColorCircle = function(){
        var index = currentMesh.name.split(':')[1];
        if(currentMesh.material.name == matBlanc.name){
            currentMesh.material = matNoir;
            forme.value[index] = 1;
        }else{
            currentMesh.material = matBlanc;
            forme.value[index] = 0;
        }
    }

    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                if (pointerInfo.pickInfo.hit) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                }
                break;
            
        }
    });

    return scene;
}

function moveCamera(camera, pos, cameraPos, lockedTarget){
    if(pos === 1)
        position.value = "coffre";
    else if(pos === -1)
        position.value = "trappe";
    else if(pos === 0)
        position.value = "images";

    camera.position = cameraPos;
    camera.setTarget(lockedTarget);
    camera.lockedTarget = lockedTarget;
}

function moveCameraInit(camera){
    position.value = "centre";

    camera.position = new Vector3(0, 1.6, -3);
    camera.setTarget(new Vector3(0,1.6,0))
    camera.lockedTarget = null;
}

const placeItem = (scene, item) => {
    if (item === 'gemmeTriangle'){
        getGemme(scene, 'triangle').then(() => {
            scene.getMeshByName('gemmeTriangle').rotation = new Vector3(Math.PI/4, Math.PI/4, 0);
            scene.getMeshByName('gemmeTriangle').position = new Vector3(4.75, 0, 1.5);
            scene.getMeshByName('gemmeTriangle').name = 'item:gemmeTriangle';
        })
            return position.value;
    }else if (item === 'gemmeCarre'){
        getGemme(scene, 'carre').then(() => {
            scene.getMeshByName('gemmeCarre').rotation = new Vector3(Math.PI/4, Math.PI/4, 0);
            scene.getMeshByName('gemmeCarre').position = new Vector3(4.75, 0, 1.5);
            scene.getMeshByName('gemmeCarre').name = 'item:gemmeCarre';
        })
            return position.value;
    }
    
    return 'erreur';
};

function verifItemTrappe(scene, nomItem){
    if(position.value === "trappe"){
        useApi().post('/game/trappe/put-item', {item: nomItem})
                .then(res => {
                    const data = res.data;
                    useAuth().user = data.user;
                    useAuth().game.trappe = data.game.trappe;
                    if (data.status === 'ok') {
                        placeItem(scene,nomItem)
                    }
                })
                .catch(console.log);
    }
    
}
export {createScene, verifItemTrappe};