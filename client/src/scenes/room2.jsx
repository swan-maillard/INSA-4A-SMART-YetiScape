/* eslint-disable */
import {
  Engine,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  PointerEventTypes,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { computed, ref } from "@vue/runtime-core";
import {
  getBaseGemme,
  getCoffreRouage,
  getGemme,
  getImportedMesh,
  getNavette,
  getPorte,
  getSalle,
  getTuyau,
  putGemmeInBase
} from "./roomsElements";
import useAuth from "../stores/auth.store";
import useApi from "../stores/api.store";
import socketio from "@/services/socketio";

//Salle 2 :
//Position possible : centre, murDroite, tuyau, coffreRouage
const position = ref("centre");

const createScene = (canvas) => {
  //base pour creer la scene
  const engine = new Engine(canvas);
  const scene = new Scene(engine);

  const socket = socketio.socket;
  socket.on("game/tuyau-arrived", (data) => {
    useAuth().game.tuyau = data.tuyau;
    useAuth().game.itemsDispo = data.itemsDispo;
    placeEngNavette(scene);
  });

  //On ajoute une caméra et une lumière
  const camera = new FreeCamera("camera1", new Vector3(0, 1.6, -3), scene);
  camera.setTarget(new Vector3(0, 2, 5));
  camera.inputs.clear();
  camera.inputs.addMouse();
  camera.attachControl(canvas, true); ///TODO : blocker pour diminuer l'amplitude de mvt

  new HemisphericLight("light", Vector3.Up(), scene);

  //Element de base de la scene :
  getSalle(scene, 2);
  getCoffreRouage(scene);
  getImportedMesh(scene, "engrenagePetit", "rouille.jpg").then(() => {
    let eng1 = scene.getMeshByName("engrenagePetit");
    eng1.position = new Vector3(2.1, 0.12, 4.1);
    eng1.setPivotPoint = new Vector3(2.1, 0.12, 4.1);
    eng1.scalingDeterminant = 0.1;
    eng1.name = "dragEngP1||2.1,0.12,4.1";
    let eng2 = eng1.clone("dragEngP2||2.4,0.12,4");
    eng2.position = new Vector3(2.4, 0.12, 4);
    let eng3 = eng1.clone("dragEngP3||2.65,0.12,4.1");
    eng3.position = new Vector3(2.65, 0.12, 4.1);
  });
  var pickPlane = MeshBuilder.CreatePlane("pickPlane", { size: 2 });
  pickPlane.isVisible = false;
  pickPlane.position = new Vector3(-2, 1, 3.8);
  pickPlane.isPickable = true;
  getPorte(scene);
  getTuyau(scene);

  var romainPlane = createTexturePlane(scene, 3, 0.6, "nombreRomain");
  romainPlane.rotation = new Vector3(0, -Math.PI / 2, 0);
  romainPlane.position = new Vector3(-4.7, 2.3, 0);

  var eclairPlane = createTexturePlane(scene, 4, 3, "eclair");
  eclairPlane.rotation = new Vector3(0, Math.PI / 2, 0);
  eclairPlane.position = new Vector3(4.7, 2.3, -1);

  getBaseGemme(scene, 'ronde');
  //Fin des elements de base de la scene

  //Elements reactifs de la scene
  const game = computed(() => useAuth().game);
  game.value.itemsDispo.forEach((e) => {
    placeItemInit(scene, e);
  });
  if (
    game.value.coffreRouage.etapeActuelle != game.value.coffreRouage.nbEtapes
  ) {
    game.value.coffreRouage.items.forEach((e) => {
      placeEngrOnCoffre(scene, e);
    });
  }
  if (game.value.tuyau.etapeActuelle == game.value.tuyau.nbEtapes) {
    placeNavette(scene);
  }
  if (game.value.porte.items.includes('gemmeRonde')){
    putGemmeInBase(scene, 'gemmeRonde');
  }
  //Fin des element réactifs de la scene

  engine.runRenderLoop(() => {
    scene.render();
  });

  var solution = [];
  var currentMesh;
  var drag = false;

  var pointerDown = function (mesh) {
    currentMesh = mesh;
    console.log("click sur " + currentMesh.name);
    if (currentMesh.name.startsWith("item")) {
      useApi()
        .post("/game/pick-item", { item: currentMesh.name.split(":")[1] })
        .then((res) => {
          const data = res.data;
          if (data.status === "ok") {
            useAuth().user = data.user;
            useAuth().game.itemsDispo = data.game.itemsDispo;
          }
          currentMesh.dispose();
        })
        .catch(console.log);
    }
    if (position.value === "centre") {
      if (currentMesh.name === "coffreRouage") {
        moveCamera(
          camera,
          1,
          new Vector3(-2.4, 1.3, 1),
          new Vector3(-2.4, 0.8, 4.2)
        );
      } else if (currentMesh.name === "nombreRomain") {
        moveCamera(
          camera,
          0,
          new Vector3(-3, 1.6, 0),
          new Vector3(-5.7, 2.3, 0)
        );
      } else if (currentMesh.name === "tuyauOut") {
        moveCamera(camera, 0, new Vector3(1, 1.6, -1), new Vector3(5, 1.7, -1));
      } else if(currentMesh.name.startsWith("base")) {
        moveCamera(camera, 2, new Vector3(2,1.6,1), new Vector3(2,1.6,6))
      }
    } else if (position.value === "coffreRouage") {
      if (currentMesh.name.startsWith("dragEng")) {
        drag = true;
        currentMesh.rotation = new Vector3(Math.PI / 2, 0, 0);
      } else if (currentMesh.name === "engBas") {
        let bon = verifRouage(scene, solution);
        console.log("verification du puzzle : " + bon);
        if (bon === true) {
          verif(position.value, true).then(() => {
            putGemmeInit(scene);
          });
        }
      }
    }
    if (position.value !== "centre" && currentMesh.name === "allWalls") {
      console.log("Retour position départ");
      moveCameraInit(camera);
    }
  };

  var replaceEngInit = function (currentMesh, forceOrigin) {
    let engComps = currentMesh.name.split("|");
    let pos = [];
    if (forceOrigin || engComps[1] === "") {
      // retour a la position sol
      currentMesh.rotation = new Vector3(0, 0, 0);
      pos = engComps[2].split(",");
      if (engComps[1] !== "") {
        let cyl = scene.getMeshByName(engComps[1] + "|" + engComps[0]);
        let cylComps = cyl.name.split("|");
        solution[cylComps[0].charAt(3)] = "";
        cyl.name = cylComps[0] + "|";
        engComps[1] = "";
        currentMesh.name = engComps.join("|");
      }
    } else {
      let cyl = scene.getMeshByName(engComps[1] + "|" + engComps[0]);
      pos[0] = -cyl.position.x;
      pos[1] = cyl.position.y;
      pos[2] = cyl.position.z;
    }
    currentMesh.position = new Vector3(...pos);
  };

  var pointerUp = function (pickedMesh) {
    if (drag) {
      if (pickedMesh.name.startsWith("cyl")) {
        // j'ai fini sur un cyl
        if (pickedMesh.name.endsWith("|")) {
          // le cyl est dispo, je le deplace
          let engComps = currentMesh.name.split("|");
          let cylComps = pickedMesh.name.split("|");
          solution[cylComps[0].charAt(3)] = engComps[0].charAt(
            engComps[0].length - 2
          );
          solution[engComps[1].charAt(3)] = "";
          if (engComps[1] !== "") {
            scene.getMeshByName(engComps[1] + "|" + engComps[0]).name =
              engComps[1] + "|";
          }
          engComps[1] = cylComps[0];
          cylComps[1] = engComps[0];
          currentMesh.name = engComps.join("|");
          pickedMesh.name = cylComps.join("|");
          currentMesh.position.x = -pickedMesh.position.x;
          currentMesh.position.z = pickedMesh.position.z;
          currentMesh.position.y = pickedMesh.position.y;
        } else {
          //sinon je le remet a sa position d'avant
          replaceEngInit(currentMesh, false, solution);
        }
      } else {
        // ou je le remet a sa position de départ si je touche pas de cylindre
        replaceEngInit(currentMesh, true, solution);
      }
      drag = null;
    }
  };

  var pointerMove = function () {
    if (!drag) {
      return;
    }
    var current = getWallPosition();
    if (!current) {
      return;
    }
    currentMesh.position.x = -current.x;
    currentMesh.position.y = current.y;
    currentMesh.position.z = current.z;
  };

  var getWallPosition = function () {
    var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
      return mesh == pickPlane;
    });
    if (pickinfo.hit) {
      return pickinfo.pickedPoint;
    }
    return null;
  };

  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case PointerEventTypes.POINTERDOWN:
        if (pointerInfo.pickInfo.hit) {
          pointerDown(pointerInfo.pickInfo.pickedMesh);
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

  function verifRouage(scene, solution) {
    let sol = solution.join("");
    let count = 0;
    if (scene.getMeshByName("dragEngP1||2.1,0.12,4.1")) {
      count++;
    }
    if (scene.getMeshByName("dragEngP2||2.4,0.12,4")) {
      count++;
    }
    if (scene.getMeshByName("dragEngP3||2.65,0.12,4.1")) {
      count++;
    }
    if (count != 1) sol = "faux";
    console.log("solution : ", sol);
    useApi()
      .post("/game/rouages/solve", { configuration: sol })
      .then((res) => {
        const data = res.data;
        useAuth().user = data.user;
        useAuth().game.coffreRouage = data.game.rouages;
        if (data.status === "ok") {
          useAuth().game.itemsDispo = data.game.itemsDispo;
          placeItemInit(scene, "gemmeRonde");
        }
      })
      .catch(console.log);
  }
  return scene;
};

function moveCamera(camera, pos, cameraPos, lockedTarget) {
  if (pos === 1) position.value = "coffreRouage";
  else if (pos === -1) position.value = "tuyaux";
  else if (pos === 0) position.value = "images";
  else if(pos === 2) position.value="porte";

  camera.position = cameraPos;
  camera.setTarget(lockedTarget);
  camera.lockedTarget = lockedTarget;
}

function moveCameraInit(camera) {
  position.value = "centre";

  camera.position = new Vector3(0, 1.6, -3);
  camera.setTarget(new Vector3(0, 1.6, 0));
  camera.lockedTarget = null;
}

const placeEngrOnCoffre = (scene, item) => {
  if (item === "engrenageGrand") {
    getImportedMesh(scene, "engrenageGrand", "rouille.jpg").then(() => {
      scene.getMeshByName("engrenageGrand").position = new Vector3(
        2.9,
        0.1,
        3.8
      );
      scene.getMeshByName("engrenageGrand").scalingDeterminant = 0.16;
      scene.getMeshByName("engrenageGrand").name = "dragEngG3||2.9,0.1,3.8";
    });
  }
  if (item === "engrenageMoyen") {
    getImportedMesh(scene, "engrenageMoyen", "rouille.jpg").then(() => {
      scene.getMeshByName("engrenageMoyen").position = new Vector3(2, 0.1, 3.8);
      scene.getMeshByName("engrenageMoyen").scalingDeterminant = 0.15;
      scene.getMeshByName("engrenageMoyen").name = "dragEngM0||2,0.1,3.8";
    });
  }
};

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

function placeItemInit(scene, nomItem) {
  if (nomItem == "engrenageGrand") {
    getImportedMesh(scene, "engrenageGrand", "rouille.jpg").then(() => {
      scene.getMeshByName("engrenageGrand").position = new Vector3(
        -2.4,
        0.15,
        2.4
      );
      scene.getMeshByName("engrenageGrand").scalingDeterminant = 0.16;
      scene.getMeshByName("engrenageGrand").name = "item:engrenageGrand";
    });
  } else if (nomItem == "gemmeRonde") {
    getGemme(scene, "ronde").then(() => {
      scene.getMeshByName("gemmeRonde").rotation = new Vector3(
        Math.PI / 4,
        Math.PI / 4,
        0
      );
      scene.getMeshByName("gemmeRonde").position = new Vector3(2.45, 1.05, 4.2);
      scene.getMeshByName("gemmeRonde").name = "item:gemmeRonde";
    });
  } else if (nomItem == "engrenageMoyen") {
    placeEngMoyen(scene);
  }
}

function placeEngMoyen(scene) {
  getImportedMesh(scene, "engrenageMoyen", "rouille.jpg").then(() => {
    let gear = scene.getMeshByName("engrenageMoyen");
    gear.position = new Vector3(-3, 0.15, -1);
    gear.scalingDeterminant = 0.1;
    gear.name = "item:engrenageMoyen";
  });
}

function verif(scene, nomItem) {
  console.log("verif : ", scene);
  verifEngInRouage(scene, nomItem);
}

//reception socket tube
function placeEngNavette(scene) {
  placeEngMoyen(scene);
  placeNavette(scene);
}

function placeNavette(scene) {
  getNavette(scene).then(() => {
    let navBase = scene.getMeshByName("navetteVide");
    navBase.position = new Vector3(3, 0.13, -1.5);
    navBase.rotation = new Vector3(0, Math.PI / 3, Math.PI / 25);
    let navCouvercle = scene.getMeshByName("navetteCouvercle");
    navCouvercle.position = new Vector3(-2.6, 0.15, 0);
    navCouvercle.rotation = new Vector3(0, Math.PI / 2, 0);
  });
}

function verifEngInRouage(scene, nomItem) {
  if (position.value === "coffreRouage") {
    useApi()
      .post("/game/rouages/put-gear", { item: nomItem })
      .then((res) => {
        const data = res.data;
        useAuth().user = data.user;
        useAuth().game.coffreRouage = data.game.rouage;
        if (data.status === "ok") {
          placeEngrOnCoffre(scene, nomItem);
        }
      })
      .catch(console.log);
  } else if (position.value === "porte") {
    useApi()
      .post("/game/porte/put-item", { item: nomItem })
      .then((res) => {
        const data = res.data;
        useAuth().user = data.user;
        useAuth().game.porte = data.game.porte;
        if (data.status === "ok") {
          putGemmeInBase(scene, nomItem);
        }
      })
      .catch(console.log);
  }
}

export { createScene, verif };
