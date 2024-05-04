/* eslint-disable */
import {PointerEventTypes, Engine, Scene, FreeCamera, Vector3, HemisphericLight, DynamicTexture, StandardMaterial, MeshBuilder, Color3} from "@babylonjs/core";
import {ref} from "@vue/runtime-core";
import {getPorte,  getSalle, getCoffreGemmes, getCodeCoffre} from "./roomsElements";

//Salle 3 : 
// position possible : centre, trappe, image, coffre
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

    var mursSalle = getSalle(scene, 3);
    getPorte(scene);
    getCoffreGemmes(scene);

    // Creation code coffre
    const code = ref([0,0,0,0]); // valeur de la combinaison du coffre

    var texture = new Array();
    for(var i=0; i<4; i++){
        texture.push(getCodeCoffre(scene,i,3.5-i*0.3));
    }

    engine.runRenderLoop(() => {
        scene.render();
    });

    var currentMesh;

    var pointerDown = function (mesh) {
        currentMesh = mesh;
        if(position.value === "centre"){
            if(currentMesh.name.startsWith("wooden_crate")){
                moveCamera(camera, 1,1.6,3, 1 );
            }
        }
        else if(position.value === "coffre"){
            if(currentMesh.name.startsWith("add")){
                addNumberCode();
            }
            if(currentMesh.name.startsWith("sub")){
                subNumberCode();
            }
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

function moveCamera(camera, x, y, z, pos){
    if(pos === -1)
        position.value = "coffre";
    else
        position.value = "coffre";

    var target = new Vector3(x,y,z);
    camera.position = target;
    camera.setTarget(new Vector3(x+pos,y,z));
    camera.lockedTarget = new Vector3(x+pos,y,z);
}

export {createScene};