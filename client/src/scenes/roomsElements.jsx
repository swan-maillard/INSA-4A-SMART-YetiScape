/* eslint-disable */

import { Texture, Mesh, SceneLoader, Vector3, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";
import "@babylonjs/loaders";

function getPorte(scene){
    let textureDoor = new Texture("./textures/door.jpg", scene);
    let matDoor = new StandardMaterial("matDoor");
    matDoor.diffuseTexture = textureDoor;

    const result = SceneLoader.ImportMeshAsync("", "./models/", "porte.glb", scene);
    result.then((resultat) => {
        for (var i = 1; i < resultat.meshes.length; i++) {
            resultat.meshes[i].position.z = 4.2;
            resultat.meshes[i].material = matDoor;
        }
    })
}

function getTuyau(scene) {
    return SceneLoader.ImportMeshAsync("tuyau", "./models/", "tuyau.glb", scene)
    .then(() => {
        let tuyau = scene.getMeshByName('tuyau');
        tuyau.scalingDeterminant = 0.3;
        //tuyau.position = new Vector3(1, 1, 1);
        tuyau.rotation = new Vector3(Math.PI / 2, - Math.PI / 2, 0);
        tuyau.position = new Vector3(-4, 1.7, -1);
        tuyau.name = 'tuyauOut';
        var mat = new StandardMaterial();
        mat.diffuseColor = Color3.Yellow();
        mat.backFaceCulling = false;
        tuyau.material = mat;
    });
}

function getTuyaux(scene) {
    var tuyaux = [];
    var mats = [Color3.Red(), Color3.Purple(), Color3.Black(), Color3.Gray(), Color3.Green(),  Color3.Yellow(),Color3.Blue(), Color3.White()]
    return SceneLoader.ImportMeshAsync("tuyau", "./models/", "tuyau.glb", scene)
    .then(() => {
        tuyaux[0] = scene.getMeshByName('tuyau');
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
    });
}

function getCoffreRouage() {

}

function getSalle(scene, numSalle){
    let textureMur = new Texture("./textures/mur.jpg", scene);
    let matMur = new StandardMaterial("matMur");
    matMur.diffuseTexture = textureMur;
    matMur.backFaceCulling = false;

    let murDos = MeshBuilder.CreateBox("murDos", { width: 10, height: 4, depth: 1 }, scene);
    murDos.position = new Vector3(0, 2, -5);

    let murGauche;
    let murDroite;
    if (numSalle == 3) {
        murGauche = getMurTrappe(scene);
        murDroite = MeshBuilder.CreateBox("murPlein", { width: 0.5, height: 4, depth: 10 }, scene);
        murGauche.position = new Vector3(-5, 1, 0);
        murDroite.position = new Vector3(5, 2, 0);
    } else if (numSalle == 2){
        murGauche = MeshBuilder.CreateBox("murPlein", { width: 0.5, height: 4, depth: 10 }, scene);
        murDroite = MeshBuilder.CreateBox("murPlein", { width: 0.5, height: 4, depth: 10 }, scene);
        murGauche.position = new Vector3(-5, 2, 0);
        murDroite.position = new Vector3(5, 2, 0);
    } else if (numSalle == 1) {
        murGauche = MeshBuilder.CreateBox("murPlein", { width: 1, height: 4, depth: 10 }, scene);
        murDroite = getMurTrappe(scene);
        murGauche.position = new Vector3(-5, 2, 0);
        murDroite.position = new Vector3(5, 0, 0);
    }

    let murFond = MeshBuilder.CreateBox("murFond", { width: 10, height: 4, depth: 1 }, scene);
    murFond.position = new Vector3(0, 2, 5);

    let ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    let roof = MeshBuilder.CreateGround("roof", { width: 10, height: 10 }, scene);
    roof.position.y = 4;

    let allWalls = Mesh.MergeMeshes([murDos, murDroite, murGauche, murFond, ground, roof]);

    if (numSalle == 1) {
        let etagere = MeshBuilder.CreateBox("etagere", {width : 0.5, height:0.1, depth: 0.5}, scene);
        etagere.position = new Vector3(-4.1, 1.3, 1.3);
        allWalls = Mesh.MergeMeshes([allWalls, etagere]);
    }
    allWalls.material = matMur;
    allWalls.name = 'allWalls';

    return allWalls;
}

function getMurTrappe(scene) {
    let mur1 = MeshBuilder.CreateBox("mur1", { width: 0.5, height: 4, depth: 3 }, scene);
    mur1.position = new Vector3(0, 2, 3.5);
    let mur2 = MeshBuilder.CreateBox("mur2", { width: 0.5, height: 3.6, depth: 1 }, scene);
    mur2.position = new Vector3(0, 2.2, 1.5);
    let mur3 = MeshBuilder.CreateBox("mur3", { width: 0.5, height: 4, depth: 6 }, scene);
    mur3.position = new Vector3(0, 2, -2);

    let murTrou = Mesh.MergeMeshes([mur1, mur2, mur3]);
    return murTrou;
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

async function getImportedMesh(scene, nomModel, nomTexture) {
    return await SceneLoader.ImportMeshAsync(nomModel, "./models/", nomModel + ".glb", scene)
    .then(() => {
        let gear = scene.getMeshByName(nomModel)
        if (nomTexture !== undefined) {
            const textureRouille = new Texture("./textures/" + nomTexture, scene);
            const matRouille = new StandardMaterial("matRouille");
            matRouille.diffuseTexture = textureRouille;
            gear.material = matRouille;
        }
    });
}

async function getCoffre(scene) {
    const textureRouille = new Texture("./textures/copper.jpg", scene);
    const matRouille = new StandardMaterial("matRouille");
    matRouille.diffuseTexture = textureRouille;
    var cyl = [];
    cyl[0] = MeshBuilder.CreateCylinder('cyl0', {height:0.1, diameter:0.06, tessellation:10}, scene);
    cyl[0].position = new Vector3(-2.53, 0.35, 4.2);
    cyl[0].rotation = new Vector3(Math.PI / 2, 0, 0);
    cyl[0].material = matRouille;
    cyl[1] = cyl[0].clone('cyl1');
    cyl[1].position = new Vector3(-2.26, 0.34, 4.2);
    cyl[2] = cyl[0].clone('cyl2');
    cyl[2].position = new Vector3(-2.16, 0.48, 4.2);
    cyl[3] = cyl[0].clone('cyl3');
    cyl[3].position = new Vector3(-2.3, 0.7, 4.2);
    cyl[4] = cyl[0].clone('cyl4');
    cyl[4].position = new Vector3(-2.53, 0.61, 4.2);
    return await SceneLoader.ImportMeshAsync("coffreRouage", "./models/", "coffreRouage.glb", scene)
    .then(() => {
        let coffre = scene.getMeshByName('coffreRouage')
        coffre.material = matRouille;
        coffre.position = new Vector3(2.4, 0.5, 4.2);
    });
}

function getNavette(scene) {
    SceneLoader.ImportMeshAsync("", "./models/", "navette.glb", scene)
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
export {getPorte, getTuyaux, getSalle, getTuyau, getTrappe, getImportedMesh, getNavette, getCoffre};