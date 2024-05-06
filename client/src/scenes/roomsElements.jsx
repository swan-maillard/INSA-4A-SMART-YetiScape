/* eslint-disable */

import {
  DynamicTexture,
  Texture,
  Mesh,
  SceneLoader,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";
import "@babylonjs/loaders";

async function getPorte(scene) {
  let textureDoor = new Texture("./textures/door.jpg", scene);
  let matDoor = new StandardMaterial("matDoor");
  matDoor.diffuseTexture = textureDoor;

  const resultat = await SceneLoader.ImportMeshAsync(
    "",
    "./models/",
    "porte.glb",
    scene
  );
  for (var i = 1; i < resultat.meshes.length; i++) {
    resultat.meshes[i].material = matDoor;
  }
  resultat.meshes[2].parent = resultat.meshes[1];
  resultat.meshes[3].parent = resultat.meshes[1];
  resultat.meshes[1].rotation = new Vector3(0, Math.PI, 0);
  resultat.meshes[1].position.z = 4.2;
}

function getTuyau(scene) {
  return SceneLoader.ImportMeshAsync(
    "tuyau",
    "./models/",
    "tuyau.glb",
    scene
  ).then(() => {
    let tuyau = scene.getMeshByName("tuyau");
    tuyau.scalingDeterminant = 0.3;
    //tuyau.position = new Vector3(1, 1, 1);
    tuyau.rotation = new Vector3(Math.PI / 2, -Math.PI / 2, 0);
    tuyau.position = new Vector3(-4, 1.7, -1);
    tuyau.name = "tuyauOut";
    var mat = new StandardMaterial();
    mat.diffuseColor = Color3.Gray();
    mat.backFaceCulling = false;
    tuyau.material = mat;
  });
}

function getTuyaux(scene) {
  var tuyaux = [];
  var mats = [
    Color3.Red(),
    Color3.Purple(),
    Color3.Black(),
    Color3.Gray(),
    Color3.Green(),
    Color3.Yellow(),
    Color3.Blue(),
    Color3.White(),
  ];
  return SceneLoader.ImportMeshAsync(
    "tuyau",
    "./models/",
    "tuyau.glb",
    scene
  ).then(() => {
    tuyaux[0] = scene.getMeshByName("tuyau");
    tuyaux[0].scalingDeterminant = 0.3;
    tuyaux[0].rotation = new Vector3(Math.PI / 2, Math.PI / 2, 0);
    tuyaux[0].position = new Vector3(3.8, 1.7, -1);
    tuyaux[0].name = "tuyau0";
    var mat = new StandardMaterial();
    mat.diffuseColor = mats[0];
    mat.backFaceCulling = false;
    tuyaux[0].material = mat;
    for (let i = 1; i < 8; i++) {
      tuyaux[i] = tuyaux[0].clone("tuyau" + i);
      tuyaux[i].position.z = -1 + 0.25 * i;
      tuyaux[i].position.y = i % 2 == 0 ? 1.7 : 1.4;
      let mat = new StandardMaterial();
      mat.diffuseColor = mats[i];
      mat.backFaceCulling = false;
      tuyaux[i].material = mat;
    }
  });
}

function getSalle(scene, numSalle) {
  let textureMur = new Texture("./textures/mur.jpg", scene);
  let matMur = new StandardMaterial("matMur");
  matMur.diffuseTexture = textureMur;
  matMur.backFaceCulling = false;

  let murDos = MeshBuilder.CreateBox(
    "murDos",
    { width: 10, height: 4, depth: 1 },
    scene
  );
  murDos.position = new Vector3(0, 2, -5);

  let murGauche;
  let murDroite;
  if (numSalle == 3) {
    murGauche = getMurTrappe(scene);
    murDroite = MeshBuilder.CreateBox(
      "murPlein",
      { width: 0.5, height: 4, depth: 10 },
      scene
    );
    murGauche.position = new Vector3(-5, 0, 0);
    murDroite.position = new Vector3(5, 2, 0);
  } else if (numSalle == 2) {
    murGauche = MeshBuilder.CreateBox(
      "murPlein",
      { width: 0.5, height: 4, depth: 10 },
      scene
    );
    murDroite = MeshBuilder.CreateBox(
      "murPlein",
      { width: 0.5, height: 4, depth: 10 },
      scene
    );
    murGauche.position = new Vector3(-5, 2, 0);
    murDroite.position = new Vector3(5, 2, 0);
  } else if (numSalle == 1) {
    murGauche = MeshBuilder.CreateBox(
      "murPlein",
      { width: 1, height: 4, depth: 10 },
      scene
    );
    murDroite = getMurTrappe(scene);
    murGauche.position = new Vector3(-5, 2, 0);
    murDroite.position = new Vector3(5, 0, 0);
  }

  let murFond = MeshBuilder.CreateBox(
    "murFond",
    { width: 10, height: 4, depth: 1 },
    scene
  );
  murFond.position = new Vector3(0, 2, 5);

  let ground = MeshBuilder.CreateGround(
    "ground",
    { width: 20, height: 20 },
    scene
  );
  let roof = MeshBuilder.CreateGround("roof", { width: 10, height: 10 }, scene);
  roof.position.y = 4;

  let allWalls = Mesh.MergeMeshes([
    murDos,
    murDroite,
    murGauche,
    murFond,
    ground,
    roof,
  ]);

  if (numSalle == 1) {
    let etagere = MeshBuilder.CreateBox(
      "etagere",
      { width: 0.5, height: 0.1, depth: 0.5 },
      scene
    );
    etagere.position = new Vector3(-4.1, 1.3, 1.3);
    allWalls = Mesh.MergeMeshes([allWalls, etagere]);
  }
  allWalls.material = matMur;
  allWalls.name = "allWalls";
  
  createTexturePlane(scene, 2, 3, 'sortie');
  scene.getMeshByName('sortie').position = new Vector3(-0.04, 1.5, 4.25);

  return allWalls;
}

function getMurTrappe(scene) {
  let mur1 = MeshBuilder.CreateBox(
    "mur1",
    { width: 0.5, height: 4, depth: 3 },
    scene
  );
  mur1.position = new Vector3(0, 2, 3.5);
  let mur2 = MeshBuilder.CreateBox(
    "mur2",
    { width: 0.5, height: 3.6, depth: 1 },
    scene
  );
  mur2.position = new Vector3(0, 2.2, 1.5);
  let mur3 = MeshBuilder.CreateBox(
    "mur3",
    { width: 0.5, height: 4, depth: 6 },
    scene
  );
  mur3.position = new Vector3(0, 2, -2);

  let murTrou = Mesh.MergeMeshes([mur1, mur2, mur3]);
  return murTrou;
}

function getTrappe(scene) {
  let textureTrappe = new Texture("./img/trappe.PNG", scene);
  let matTrappe = new StandardMaterial("matTrappe");
  matTrappe.diffuseTexture = textureTrappe;
  let trappe = MeshBuilder.CreateGround(
    "trappe",
    { width: 1, height: 0.4 },
    scene
  );
  trappe.position = new Vector3(4.75, 0.2, 1.5);
  trappe.material = matTrappe;
  trappe.rotation = new Vector3(-Math.PI / 2, 0, Math.PI / 2);

  return trappe;
}

function getTrappeGauche(scene) {
  let matTrappe = new StandardMaterial("matTrappe");
  matTrappe.diffuseColor = Color3.Gray();
  let trappe = MeshBuilder.CreateGround(
    "trappe",
    { width: 1, height: 0.4 },
    scene
  );
  trappe.position = new Vector3(-4.75, 0.2, 1.5);
  trappe.material = matTrappe;
  trappe.rotation = new Vector3(Math.PI / 2, 0, -Math.PI / 2);
  const matBlanc = new StandardMaterial("matBlanc", scene);
  matBlanc.diffuseColor = Color3.White();

  for (var i = 0; i < 5; i++) {
    let haut = MeshBuilder.CreateCylinder(
      "cercle:" + i,
      { diameter: 0.07, height: 0.01 },
      scene
    );
    haut.position = new Vector3(-4.75, 0.3, 1.1 + i * 0.2);
    haut.rotation = new Vector3(Math.PI / 2, 0, -Math.PI / 2);
    haut.material = matBlanc;

    let milieu = MeshBuilder.CreateCylinder(
      "cercle:" + (i + 5),
      { diameter: 0.07, height: 0.01 },
      scene
    );
    milieu.position = new Vector3(-4.75, 0.2, 1.1 + i * 0.2);
    milieu.rotation = new Vector3(Math.PI / 2, 0, -Math.PI / 2);
    milieu.material = matBlanc;

    let bas = MeshBuilder.CreateCylinder(
      "cercle:" + (i + 10),
      { diameter: 0.07, height: 0.01 },
      scene
    );
    bas.position = new Vector3(-4.75, 0.1, 1.1 + i * 0.2);
    bas.rotation = new Vector3(Math.PI / 2, 0, -Math.PI / 2);
    bas.material = matBlanc;
  }
}

async function getImportedMesh(scene, nomModel, nomTexture) {
  return await SceneLoader.ImportMeshAsync(
    nomModel,
    "./models/",
    nomModel + ".glb",
    scene
  ).then(() => {
    let mesh = scene.getMeshByName(nomModel);
    if (nomTexture !== undefined) {
      let mat = scene.getMaterialByName(nomTexture);
      if (mat == null) {
        let text = new Texture("./textures/" + nomTexture, scene);
        mat = new StandardMaterial(nomTexture);
        mat.diffuseTexture = text;
      }
      mesh.material = mat;
    }
  });
}

async function getGemme(scene, forme) {
  let mat = new StandardMaterial();
  let nom;
  if (forme == "triangle") {
    nom = "gemmeTriangle";
    mat.diffuseColor = Color3.Green();
  } else if (forme == "carre") {
    nom = "gemmeCarre";
    mat.diffuseColor = Color3.Red();
  } else {
    nom = "gemmeRonde";
    mat.diffuseColor = Color3.Blue();
  }

  return await SceneLoader.ImportMeshAsync(
    nom,
    "./models/",
    "gemmes.glb",
    scene
  ).then(() => {
    let gemme = scene.getMeshByName(nom);
    gemme.material = mat;
  });
}

async function getBaseGemme(scene, forme) {
  let mat = new StandardMaterial();
  let nom;
  if (forme == "triangle") {
    nom = "baseTriangle";
    mat.diffuseColor = Color3.Green();
  } else if (forme == "carre") {
    nom = "baseCarre";
    mat.diffuseColor = Color3.Red();
  } else {
    nom = "baseRonde";
    mat.diffuseColor = Color3.Blue();
  }

  return await SceneLoader.ImportMeshAsync(
    nom,
    "./models/",
    "gemmes.glb",
    scene
  ).then(() => {
    let base = scene.getMeshByName(nom);
    base.material = mat;
    base.rotation = new Vector3(- Math.PI/2, 0, 0);
    base.position = new Vector3(-2, 2, 4.35);
  });
}
function putGemmeInBase(scene, nomItem){
  getGemme(scene, nomItem.substring(5).toLowerCase()).then(() => {
    let itemGemme = scene.getMeshByName(nomItem);
    if (nomItem === 'gemmeTriangle')
      itemGemme.rotation = new Vector3(0, 0,Math.PI/3);
    else 
      itemGemme.rotation = new Vector3(0, 0, 0)
    itemGemme.position = new Vector3(-2, 2, 4.35);
  });
}

async function getCoffreRouage(scene) {
  const textureRouille = new Texture("./textures/copper.jpg", scene);
  const matRouille = new StandardMaterial("matRouille");
  matRouille.diffuseTexture = textureRouille;
  var cyl = [];
  cyl[0] = MeshBuilder.CreateCylinder(
    "cyl0|",
    { height: 0.1, diameter: 0.06, tessellation: 10 },
    scene
  );
  cyl[0].position = new Vector3(-2.53, 0.35, 4.2);
  cyl[0].rotation = new Vector3(Math.PI / 2, 0, 0);
  cyl[0].material = matRouille;
  cyl[1] = cyl[0].clone("cyl1|");
  cyl[1].position = new Vector3(-2.26, 0.34, 4.2);
  cyl[2] = cyl[0].clone("cyl2|");
  cyl[2].position = new Vector3(-2.16, 0.48, 4.2);
  cyl[3] = cyl[0].clone("cyl3|");
  cyl[3].position = new Vector3(-2.3, 0.7, 4.2);
  cyl[4] = cyl[0].clone("cyl4|");
  cyl[4].position = new Vector3(-2.53, 0.61, 4.2);
  getImportedMesh(scene, "engrenageMoyen", "rouille.jpg").then(() => {
    scene.getMeshByName("engrenageMoyen").position = new Vector3(
      2.4,
      0.05,
      4.2
    );
    scene.getMeshByName("engrenageMoyen").rotation = new Vector3(
      Math.PI / 2,
      0,
      0
    );
    scene.getMeshByName("engrenageMoyen").scalingDeterminant = 0.12;
    scene.getMeshByName("engrenageMoyen").name = "engBas";
  });
  getImportedMesh(scene, "engrenagePetit", "rouille.jpg").then(() => {
    scene.getMeshByName("engrenagePetit").position = new Vector3(
      2.45,
      0.95,
      4.2
    );
    scene.getMeshByName("engrenagePetit").rotation = new Vector3(
      Math.PI / 2,
      0,
      0
    );
    scene.getMeshByName("engrenagePetit").scalingDeterminant = 0.15;
    scene.getMeshByName("engrenagePetit").name = "engHaut";
  });
  return await SceneLoader.ImportMeshAsync(
    "coffreRouage",
    "./models/",
    "coffreRouage.glb",
    scene
  ).then(() => {
    let coffre = scene.getMeshByName("coffreRouage");
    coffre.material = matRouille;
    coffre.position = new Vector3(2.4, 0.5, 4.2);
  });
}

async function getNavette(scene) {
  const resultat = await SceneLoader.ImportMeshAsync(
    "",
    "./models/",
    "navette.glb",
    scene
  );
  let base = scene.getMeshByName("navetteBase");
  let mat = new StandardMaterial();
  mat.diffuseColor = new Color3(1, 0, 0);
  base.material = mat;
  let couvercle = scene.getMeshByName("navetteCouvercle");
  couvercle.material = mat;
  let tube = scene.getMeshByName("navetteTube");
  let matJaune = new StandardMaterial();
  matJaune.diffuseColor = new Color3(1, 1, 0);
  matJaune.alpha = 0.4;
  tube.material = matJaune;
  let navBase = Mesh.MergeMeshes([base, tube], true, false, null, false, true);
  navBase.name = "navetteVide";
  navBase.position = new Vector3(-4.1, 1.4, 1.3);
  couvercle.position = new Vector3(4.4, 1.4, 1.3);
}

async function getCoffreGemmes(scene) {
  let textureDoor = new Texture("./textures/coffre.jpg", scene);
  let matDoor = new StandardMaterial("matDoor");
  matDoor.diffuseTexture = textureDoor;

  const result = SceneLoader.ImportMeshAsync(
    "",
    "./models/",
    "coffre.glb",
    scene
  );
  result.then((resultat) => {
    for (var i = 1; i < resultat.meshes.length; i++) {
      resultat.meshes[i].material = matDoor;
      resultat.meshes[i].scalingDeterminant = 2;
      resultat.meshes[i].position.x = -4.3;
      resultat.meshes[i].position.z = 3;
      resultat.meshes[i].rotation = new Vector3(0, Math.PI / 2, 0);
    }
  });
  return result;
}

function getCodeCoffre(scene, number, coordz) {
  //Creation de l'élément avec le chiffre
  var numberTexture = new DynamicTexture(
    "textureCode:" + number,
    { height: 100, width: 100 },
    scene,
    false
  );
  numberTexture.drawText(
    "0",
    35,
    70,
    "bold 50px Arial",
    "white",
    "black",
    true
  );
  var numberMat = new StandardMaterial("matCode:" + number, scene);
  numberMat.diffuseTexture = numberTexture;

  var code = MeshBuilder.CreateBox(
    "code:" + number,
    { width: 0.25, height: 0.25, depth: 0.001 },
    scene
  );
  code.material = numberMat;
  code.position.z = coordz;
  code.position.y = 1.6;
  code.position.x = 4.5;
  code.rotation = new Vector3(0, Math.PI / 2, 0);

  // Create a dynamic texture
  var textureAdd = new DynamicTexture(
    "codeAdd:" + number,
    { height: 100, width: 100 },
    scene,
    false
  );
  textureAdd.drawText("+", 35, 70, "bold 50px Arial", "white", "blue", true);

  // Create a material with the dynamic texture
  var matAdd = new StandardMaterial("matAdd:" + number, scene);
  matAdd.diffuseTexture = textureAdd;
  var add = MeshBuilder.CreateBox(
    "add:" + number,
    { width: 0.15, height: 0.15, depth: 0.001 },
    scene
  );
  add.position.y = 1.85;
  add.position.x = 4.5;
  add.position.z = coordz;
  add.material = matAdd;
  add.rotation = new Vector3(0, Math.PI / 2, 0);

  // Create a dynamic texture
  var textureSub = new DynamicTexture(
    "codeSub:" + number,
    { height: 100, width: 100 },
    scene,
    false
  );
  textureSub.drawText("-", 35, 70, "bold 50px Arial", "white", "blue", true);

  // Create a material with the dynamic texture
  var matSub = new StandardMaterial("matSub:" + number, scene);
  matSub.diffuseTexture = textureSub;
  var sub = MeshBuilder.CreateBox(
    "sub:" + number,
    { width: 0.15, height: 0.15, depth: 0.001 },
    scene
  );
  sub.position.y = 1.35;
  sub.position.x = 4.5;
  sub.position.z = coordz;
  sub.material = matSub;
  sub.rotation = new Vector3(0, Math.PI / 2, 0);

  return numberTexture;
}

function getButtonValdier(scene) {
  var matSocle = new StandardMaterial("socleValiderMat", scene);
  matSocle.diffuseColor = Color3.Gray();
  var socle = MeshBuilder.CreateBox(
    "socleValider",
    { width: 0.2, height: 0.2, depth: 0.005 },
    scene
  );
  socle.material = matSocle;
  socle.position = new Vector3(4.5, 1.6, 2.3);
  socle.rotation = new Vector3(0, Math.PI / 2, 0);

  var matButton = new StandardMaterial("buttonValiderMat", scene);
  matButton.diffuseColor = Color3.Red();
  var button = MeshBuilder.CreateBox(
    "buttonValider",
    { width: 0.15, height: 0.15, depth: 0.05 },
    scene
  );
  button.material = matButton;
  button.position = new Vector3(4.5, 1.6, 2.3);
  button.rotation = new Vector3(0, Math.PI / 2, 0);
}

function createTexturePlane(scene, width, height, nom) {
  var planTexture = MeshBuilder.CreatePlane(nom, {
    width: width,
    height: height,
  });
  let texture = new Texture("./img/" + nom + ".png", scene);
  let mat = new StandardMaterial("matRomain");
  mat.diffuseTexture = texture;
  mat.diffuseTexture.hasAlpha = true;
  planTexture.material = mat;
  return planTexture;
}

export {
  getPorte,
  getTuyaux,
  getSalle,
  getTuyau,
  getTrappe,
  getImportedMesh,
  getNavette,
  getCoffreRouage,
  getCoffreGemmes,
  getCodeCoffre,
  getButtonValdier,
  getGemme,
  getTrappeGauche,
  getBaseGemme,
  putGemmeInBase,
  createTexturePlane
};
