/* eslint-disable */
import {PointerEventTypes, Engine, Scene, FreeCamera, Vector3, HemisphericLight, DynamicTexture, StandardMaterial, MeshBuilder, Color3} from "@babylonjs/core";
import {ref} from "@vue/runtime-core";
import {getPorte, getGemme,  getSalle, getCoffreGemmes, getCodeCoffre, getButtonValdier, getTrappeGauche} from "./roomsElements";

//Salle 3 : 
// position possible : centre, trappe, image, coffre
const position = ref("centre");

const createScene = (canvas, verif) => {
    //base pour creer la scene
    const engine = new Engine(canvas);
    const scene = new Scene(engine);

    getGemme(scene, 'triangle').then(() => {
        scene.getMeshByName('gemmeTriangle').rotation = new Vector3(Math.PI/4, Math.PI/4, 0);
        scene.getMeshByName('gemmeTriangle').position = new Vector3(-4.3, 0.2, 3);
        scene.getMeshByName('gemmeTriangle').name = 'item:gemmeTriangle';
    })

    getGemme(scene, 'carre').then(() => {
        scene.getMeshByName('gemmeCarre').rotation = new Vector3(Math.PI/4, Math.PI/4, 0);
        scene.getMeshByName('gemmeCarre').position = new Vector3(-4.3, 0.2, 3);
        scene.getMeshByName('gemmeCarre').name = 'item:gemmeCarre';
    })


    const matBlanc = new StandardMaterial("matBlanc", scene);
    matBlanc.diffuseColor = Color3.White();

    const matNoir = new StandardMaterial("matNoir", scene);
    matNoir.diffuseColor = Color3.Black();
    
    //On ajoute une caméra et une lumière
    const camera = new FreeCamera("camera1", new Vector3(0, 1.6, -3), scene);
    camera.setTarget(new Vector3(0, 2, 5));
    camera.attachControl(canvas, false); ///TODO : blocker pour diminuer l'amplitude de mvt
    console.log(camera.position)

    new HemisphericLight("light", Vector3.Up(), scene);

    var mursSalle = getSalle(scene, 3);
    getPorte(scene);

    const forme = ref([])
    for(var i=0; i<15;i++){forme.value.push(0)}
    getTrappeGauche(scene);

    getCoffreGemmes(scene);

    // Creation code coffre
    const code = ref([0,0,0,0]); // valeur de la combinaison du coffre

    var texture = new Array();
    for(var i=0; i<4; i++){
        texture.push(getCodeCoffre(scene,i,3.5-i*0.3));
    }
    getButtonValdier();

    engine.runRenderLoop(() => {
        scene.render();
    });

    var currentMesh;

    var pointerDown = function (mesh) {
        currentMesh = mesh;
        console.log("click")
        if(currentMesh.name.startsWith('item')){
            var coffre = scene.getMeshByName("wooden_crate_01_lid")
            if(coffre != null){
                verif('item', currentMesh.name.substring(5))
                .then(() => {
                    console.log("promesse tenue : on supprime l'engrenage")
                    currentMesh.dispose();
                })
                .catch(() => {
                    console.log('promesse non tenue, on garde l engrenage')
                });
            }
        }
        if(position.value === "centre"){
            if(currentMesh.name.startsWith("wooden_crate")){
                var coffre = scene.getMeshByName("wooden_crate_01_lid")
                if(coffre.isVisible){
                    moveCamera(camera, 0.5,1.6,3, 1, new Vector3(5.3,0,3) );
                }else{
                    moveCamera(camera, 3,1.6,3, 1, new Vector3(5.3,0,3) );
                }
                
            }else if(currentMesh.name === "trappe" || currentMesh.name.startsWith("cercle")){
                moveCamera(camera,-2, 0.2,1.5, -1, new Vector3(-3,0.2,1.5))
            }else if(currentMesh.name === "objetTrappe"){
                moveCamera(camera,-2, 1.6,1.5, -1, new Vector3(-5,0,1.5))
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
                verif(currentMesh.name,code)
                .then(() => {
                    //TODO: ouvrir le coffre avec les gemmes
                    console.log("Vous avez ouvert le coffre !")
                    openCoffre();
                    moveCamera(camera, 3,1.6,3, 1, new Vector3(5.3,0,3) );
                },()=>{
                    console.log("Mauvais code ...");
                    reinitCode();
                });
            }else if(currentMesh.name === "allWalls"){
                moveCameraInit(camera)
            }
        }else if(position.value === "trappe"){
            if(currentMesh.name === "allWalls"){
                moveCameraInit(camera)
            }
            else if(currentMesh.name.startsWith("cercle")){
                console.log("cercle click !")
                changeColorCircle();
            }
        }
        
    }

    var openCoffre = function(){
        var cordeCoffre = scene.getMeshByName("wooden_crate_01_latch");
        cordeCoffre.isVisible = false;
        var hautCoffre = scene.getMeshByName("wooden_crate_01_lid")
        console.log(hautCoffre);
        hautCoffre.isVisible = false;
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
        console.log("Boite cliqué Add!");
        var index = currentMesh.name.split(':')[1];
        if(code.value[index]>0)
            code.value[index]--;
        else
            code.value[index] = 9;
        texture[index].drawText(code.value[index], 35,70,"bold 50px Arial", "white", "black", true);
        texture[index].update();
    }

    var addNumberCode = function(){
        console.log("Boite cliqué Add!");
        var index = currentMesh.name.split(':')[1];
        if(code.value[index]<9)
            code.value[index]++;
        else
            code.value[index] = 0;
        texture[index].drawText(code.value[index], 35,70,"bold 50px Arial", "white", "black", true);
        texture[index].update();
    }
    
    var changeColorCircle = function(){
        console.log(currentMesh.material)
        var index = currentMesh.name.split(':')[1];
        if(currentMesh.material.name == matBlanc.name){
            currentMesh.material = matNoir;
            forme.value[index] = 1;
        }else{
            currentMesh.material = matBlanc;
            forme.value[index] = 0;
        }
        verif("trappe",forme).then(()=>{
            console.log("bien joué !")
            openTrappe();
        }, ()=>{console.log("c'est pas ça")})
    }

    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                console.log("ahhhhh!")
                if (pointerInfo.pickInfo.hit) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                }
                break;
            
        }
    });

    return scene;
}

function moveCamera(camera, x, y, z, pos, lockedTarget){
    if(pos === 1)
        position.value = "coffre";
    else if(pos === -1)
        position.value = "trappe";

    var target = new Vector3(x,y,z);
    camera.position = target;
    camera.setTarget(new Vector3(x+pos,y,z));
    camera.lockedTarget = lockedTarget;
}

function moveCameraInit(camera){
    position.value = "centre";

    camera.position = new Vector3(0, 1.6, -3);
    camera.setTarget(new Vector3(0,1.6,0))
    camera.lockedTarget = null;
}

const placeItem = (scene, item) => {
    if (position.value === "trappe") {
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
    }
    return 'erreur';
};
export {createScene, placeItem};