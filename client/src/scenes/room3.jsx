/* eslint-disable */
import {Engine, Scene, FreeCamera, Vector3, HemisphericLight} from "@babylonjs/core";
import {ref} from "@vue/runtime-core";
import {getPorte,  getSalle, getCoffre} from "./roomsElements";

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
    getCoffre(scene);

    engine.runRenderLoop(() => {
        scene.render();
    });

}

export {createScene};