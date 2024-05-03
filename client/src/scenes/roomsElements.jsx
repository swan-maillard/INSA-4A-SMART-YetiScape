import { Texture, Mesh, SceneLoader, Vector3, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";
import "@babylonjs/loaders";

function getPorte(scene){
    let textureDoor = new Texture("./textures/door.jpg", scene);
    let matDoor = new StandardMaterial("matDoor");
    matDoor.diffuseTexture = textureDoor;

    const result = SceneLoader.ImportMeshAsync("", "./models/", "porte.glb", scene, (meshes) => {
        console.log("infos meshes: " + meshes);
    });
    result.then((resultat) => {
        console.log('dabord : ' + resultat.meshes.length)
        for (var i = 1; i < resultat.meshes.length; i++) {
            resultat.meshes[i].position.z = 4;
            resultat.meshes[i].material = matDoor;
        }
    })
}


function getTuyaux(scene) {
    var tuyaux = [];
    var mats = [Color3.Black(), Color3.Green(), Color3.Red(), Color3.Blue(), Color3.Purple(), Color3.Gray(), Color3.Yellow(), Color3.White()]
    SceneLoader.ImportMeshAsync("tuyau", "./models/", "tuyau.glb", scene, (meshes) => {
        console.log("infos meshes: " + meshes);
    })
        .then((resultat) => {
            tuyaux[0] = resultat.meshes[1];
            tuyaux[0].scalingDeterminant = 0.3;
            tuyaux[0].rotation = new Vector3(Math.PI / 2, Math.PI / 2, 0);
            tuyaux[0].position = new Vector3(3.8, 1.7, -1);
            tuyaux[0].name = 'tuyau0';
            var mat = new StandardMaterial();
            mat.diffuseColor = mats[0];
            mat.backFaceCulling = false;
            tuyaux[0].material = mat;
            for (let i = 1; i < 8; i++) {
                tuyaux[i] = tuyaux[0].clone('tuyau' + i);
                tuyaux[i].position.z = -1 + 0.25 * i;
                tuyaux[i].position.y = (i % 2 == 0) ? 1.7 : 1.4;
                let mat = new StandardMaterial();
                mat.diffuseColor = mats[i];
                mat.backFaceCulling = false;
                tuyaux[i].material = mat;
            }

        })

    return tuyaux;
}

function getSalle(scene){
    let textureMur = new Texture("./textures/mur.jpg", scene);
    let matMur = new StandardMaterial("matMur");
    matMur.diffuseTexture = textureMur;
    matMur.backFaceCulling = false;

    let murDos = MeshBuilder.CreateBox("murDos", { width: 10, height: 4, depth: 1 }, scene);
    murDos.position = new Vector3(0, 2, -5);

    let murGauche = MeshBuilder.CreateBox("murGauche", { width: 1, height: 4, depth: 10 }, scene);
    murGauche.position = new Vector3(-5, 2, 0);

    /*let murDroite = MeshBuilder.CreateBox("murDroite", { width: 1, height: 4, depth: 10 }, scene);
    var posDroite = new Vector3(5, 2, 0);
    murDroite.position = posDroite;*/
    let murDroite1 = MeshBuilder.CreateBox("murDroite1", { width: 1, height: 4, depth: 3 }, scene);
    murDroite1.position = new Vector3(5, 2, 3.5);
    let murDroite2 = MeshBuilder.CreateBox("murDroite2", { width: 1, height: 3.6, depth: 1 }, scene);
    murDroite2.position = new Vector3(5, 2.2, 1.5);
    let murDroite3 = MeshBuilder.CreateBox("murDroite3", { width: 1, height: 4, depth: 6 }, scene);
    murDroite3.position = new Vector3(5, 2, -2);
    let murDroite = Mesh.MergeMeshes([murDroite1, murDroite2, murDroite3]);

    let murFond = MeshBuilder.CreateBox("murFond", { width: 10, height: 4, depth: 1 }, scene);
    murFond.position = new Vector3(0, 2, 5);

    let ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    let roof = MeshBuilder.CreateGround("roof", { width: 10, height: 10 }, scene);
    roof.position.y = 4;

    let etagere = MeshBuilder.CreateBox("etagere", {width : 0.5, height:0.1, depth: 0.5}, scene);
    etagere.position = new Vector3(-4.1, 1.3, 1.3);


    let allWalls = Mesh.MergeMeshes([murDos, murDroite, murGauche, murFond, ground, roof, etagere]);
    allWalls.material = matMur;
    allWalls.name = 'allWalls';

    return allWalls;
}

function getTrappe(scene){
    let textureTrappe = new Texture("./img/trappe.PNG", scene);
    let matTrappe = new StandardMaterial("matTrappe");
    matTrappe.diffuseTexture = textureTrappe;
    let trappe = MeshBuilder.CreateGround("trappe", {width:1, height:0.4}, scene);
    trappe.position = new Vector3(4.75,0.2,1.5);
    trappe.material = matTrappe;
    trappe.rotation = new Vector3(-Math.PI/2,0,Math.PI/2)

    return trappe;
}

function getEngrenageMoyen(scene) {
    const textureRouille = new Texture("./textures/rouille.jpg", scene);
    const matRouille = new StandardMaterial("matRouille");
    matRouille.diffuseTexture = textureRouille;
    var gear;
    SceneLoader.ImportMeshAsync("engrenageMoyen", "./models/", "engrenageMoyen.glb", scene, (meshes) => {
        console.log("infos meshes: " + meshes);
    })
    .then((resultat) => {
        console.log('engrenage moyen load de taille : ' + resultat.meshes.length)
        gear = scene.getMeshByName('engrenageMoyen')
        gear.material = matRouille;
        gear.scalingDeterminant = 0.15;
        gear.position.z = 3.6;
        gear.position.y = 0.15;
        gear.position.x = 3;
    })
    return gear;
}

function getNavette(scene) {
    SceneLoader.ImportMeshAsync("", "./models/", "navette.glb", scene, (meshes) => {
        console.log("infos meshes: " + meshes);
    })
    .then((resultat) => {
        console.log('navette : ' + resultat.meshes.length)
        let base = scene.getMeshByName('navetteBase');
        let mat = new StandardMaterial();
        mat.diffuseColor = new Color3(1, 0, 0);
        base.material = mat;

        let couvercle = scene.getMeshByName('navetteCouvercle');
        couvercle.material = mat;

        let tube = scene.getMeshByName('navetteTube');
        let matJaune = new StandardMaterial();
        matJaune.diffuseColor = new Color3(1, 1, 0);
        matJaune.alpha = .4;
        tube.material = matJaune;

        let navBase = Mesh.MergeMeshes([base, tube], true, false, null, false, true);
        navBase.name = 'navetteVide';

        navBase.position = new Vector3(-4.1, 1.4, 1.3);
        couvercle.position = new Vector3(4.4, 1.4, 1.3);
    })
}
export {getPorte, getTuyaux, getSalle, getTrappe, getEngrenageMoyen, getNavette};