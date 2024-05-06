/* eslint-disable */
import {
  Engine,
  FreeCamera,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointerEventTypes,
  Scene,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { computed, ref } from "@vue/runtime-core";
import {
  getGemme,
  getImportedMesh,
  getNavette,
  getPorte,
  getSalle,
  getTrappe,
  getTuyaux,
  getBaseGemme,
  putGemmeInBase,
  createTexturePlane,
} from "./roomsElements";
import useAuth from "../stores/auth.store";
import useApi from "../stores/api.store";
import socketio from "@/services/socketio";
import usePopup from "@/stores/popup.store";
import { itemNames } from "@/components/items";

//SAlle 1 :
// position possible : centre, tuyau (gauche), trappe (gauche)
const position = ref("centre");

const createScene = (canvas) => {
  //base pour creer la scene
  const engine = new Engine(canvas);
  const scene = new Scene(engine);
  const drag = ref(null);
  const popup = usePopup();
  const game = computed(() => useAuth().game);

  const socket = socketio.socket;
  socket.on("game/trappe-opened", (data) => {
    useAuth().game.trappe = data.trappe;
    deleteTrappe(scene);
    popup.send(data.username + " a ouvert la trappe");
  });
  socket.on("game/trappe-item-added", (data) => {
    console.log("Item placé", data);
    useAuth().game.trappe = data.trappe;
    data.trappe.items.forEach((element) => {
      putItemFromTrappe(scene, element);
    });
    popup.send(data.username + " a fait passé un objet par la trappe");
  });
  socket.on("game/portes-open", (data) => {
    console.log("ok");
    game.value.dateEnd = data.dateEnd;
    scene.getMeshByName("porteGauche").rotation = new Vector3(
      0,
      -Math.PI / 5,
      0
    );
    setTimeout(() => {
      popup.send("La porte s'est ouverte !! Encore un dernier petit effort");
    }, 50);
  });

  getBaseGemme(scene, "triangle");

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
  getPorte(scene).then(() => {
    if (game.value.portes.etapeActuelle === game.value.portes.nbEtapes) {
      scene.getMeshByName("porteGauche").rotation = new Vector3(
        0,
        -Math.PI / 5,
        0
      );
    }
  });

  var pickPlane = MeshBuilder.CreatePlane("pickPlane", { size: 10 });
  pickPlane.isVisible = false;
  pickPlane.rotation = new Vector3(0, Math.PI / 2, 0);
  pickPlane.position.x = -3.5;

  var eclairPlane = createTexturePlane(scene, 2, 2, "yeti");
  eclairPlane.rotation = new Vector3(0, Math.PI / 2, 0);
  eclairPlane.position = new Vector3(4.7, 2.3, -1);
  //var porteArriere = MeshBuilder.CreatePlane('arrierePorte', {width: 2, height:3}, scene);
  //porteArriere.position
  //Fin scene de base

  // Elements reactifs de la scene

  game.value.itemsDispo.forEach((e) => {
    console.log("je pose au sol", e);
    placeItemInit(scene, e);
  });
  if (game.value.tuyau.etapeActuelle != game.value.tuyau.nbEtapes) {
    getNavette(scene).then(() => {
      if (game.value.tuyau.items.length > 0) {
        putItemInNavette(scene, game.value.tuyau.items[0]);
      }
    });
  }
  game.value.trappe.items.forEach((element) => {
    putItemFromTrappe(scene, element);
  });
  if (game.value.trappe.etapeActuelle == game.value.trappe.nbEtapes) {
    deleteTrappe(scene);
  }
  if (game.value.portes.items.includes("gemmeTriangle")) {
    putGemmeInBase(scene, "gemmeTriangle");
  }

  engine.runRenderLoop(() => {
    scene.render();
  });

  //Interaction inputs
  var currentMesh;
  var getWallPosition = function () {
    var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
      return mesh == pickPlane;
    });
    if (pickinfo.hit) {
      return pickinfo.pickedPoint;
    }

    return null;
  };

  var getTuyauxPicked = function () {
    let tuyauTouche = -1;
    for (var i = 0; i < 8; i++) {
      var tuyauPick = scene.getMeshByName("tuyau" + i);
      var pickinfo = scene.pick(
        scene.pointerX,
        scene.pointerY,
        function (mesh) {
          return mesh == tuyauPick;
        }
      );
      if (pickinfo.hit) {
        tuyauTouche = i;
        break;
      }
    }
    return tuyauTouche;
  };

  var setOldPosition = function () {
    currentMesh.position = new Vector3(0, 0, 0);
  };

  const canInteract = (meshName) => {
    return (
      meshName.startsWith("item") ||
      meshName.startsWith("tuyau") ||
      meshName.startsWith("base") ||
      meshName === "trappe" ||
      (meshName === "sortie" &&
        game.value.portes.etapeActuelle === game.value.portes.nbEtapes) ||
      meshName === "navettePleine"
    );
  };

  var pointerDown = function (mesh) {
    currentMesh = mesh;

    if (currentMesh.name.startsWith("item")) {
      const item = currentMesh.name.split(":")[1];
      useApi()
        .post(currentMesh.name.split(":")[2], {
          item,
        })
        .then((res) => {
          const data = res.data;
          if (data.status === "ok") {
            popup.send(
              "Vous avez récupéré l'objet suivant : " + itemNames[item]
            );
            useAuth().user = data.user;
            useAuth().game.itemsDispo = data.game.itemsDispo;
          }
          currentMesh.dispose();
        })
        .catch(console.log);
    }
    if (position.value === "centre") {
      if (currentMesh.name.startsWith("tuyau")) {
        moveCamera(
          camera,
          -1,
          new Vector3(-1, 1.6, 0.125),
          new Vector3(-2, 1.6, 0.125)
        );
      } else if (currentMesh.name === "trappe") {
        moveCamera(
          camera,
          1,
          new Vector3(2, 0.2, 1.5),
          new Vector3(3, 0.2, 1.5)
        );
      } else if (currentMesh.name.startsWith("base")) {
        moveCamera(camera, 0, new Vector3(2, 1.6, 1), new Vector3(2, 1.6, 6));
      }
    } else if (position.value === "tuyau") {
      if (currentMesh.name === "allWalls") {
        moveCameraInit(camera);
      } else if (currentMesh.name === "navettePleine") {
        currentMesh.position.addInPlace(new Vector3(0.5, 0, -0.1));
        drag.value = getWallPosition();
        console.log("Click sur navette pleine " + drag.value);
      }
    } else if (position.value === "trappe") {
      if (currentMesh.name === "allWalls") {
        moveCameraInit(camera);
      }
    } else if (
      currentMesh.name === "sortie" &&
      game.value.portes.etapeActuelle === game.value.portes.nbEtapes
    ) {
      useAuth().game.isFinished = true;
    } else {
      moveCameraInit(camera);
    }
  };

  var pointerUp = function () {
    if (drag.value) {
      drag.value = null;
      let tuyauTouche = getTuyauxPicked();
      if (tuyauTouche === -1) {
        setOldPosition();
      } else {
        useApi()
          .post("/game/tuyau/envoi", { trou: tuyauTouche })
          .then((res) => {
            const data = res.data;
            useAuth().user = data.user;
            useAuth().game.tuyau = data.game.tuyau; //TODO: MAJ inventaire
            deleteNavette(scene);
            if (data.status === "ok") {
              usePopup().send(
                "La capsule tombe dans le tuyau ! Vous l'entendez s'écraser contre le sol"
              );
            } else {
              usePopup().send(
                "Quelque chose semble bloquer, la capsule ne passe pas...",
                "error"
              );
              getNavette(scene);
            }
          })
          .catch();
      }
    }
  };

  var pointerMove = function (pickedMesh) {
    if (canInteract(pickedMesh?.name || "")) {
      document.getElementById("GameCanva").style.cursor = "pointer";
    } else {
      document.getElementById("GameCanva").style.cursor = "default";
    }
    if (!drag.value) {
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
  };

  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case PointerEventTypes.POINTERDOWN:
        if (pointerInfo.pickInfo.hit) {
          pointerDown(pointerInfo.pickInfo.pickedMesh);
        }
        break;
      case PointerEventTypes.POINTERUP:
        pointerUp();
        break;
      case PointerEventTypes.POINTERMOVE:
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        pointerMove(pickResult.pickedMesh);
        break;
    }
  });

  return scene;
};

function moveCamera(camera, pos, cameraPos, lockedTarget) {
  if (pos === 1) position.value = "trappe";
  else if (pos === -1) position.value = "tuyau";
  else if (pos === 0) position.value = "porte";

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

function placeItemInit(scene, elem) {
  if (elem == "engrenageMoyen") {
    placeEngInit(scene);
  } else if (elem === "cle") {
    console.log("je put une cle");
    placeCleInit(scene);
  }
}

function placeCleInit(scene) {
  getImportedMesh(scene, "cle").then(() => {
    //scene.getMeshByName("cle").position = new Vector3(-3, 0.15, 2);
    scene.getMeshByName("cle").position = new Vector3(-2, 0.17, 1);
    scene.getMeshByName("cle").scalingDeterminant = 2;
    scene.getMeshByName("cle").name = "item:cle:/game/pick-item";
  });
}

function placeEngInit(scene) {
  getImportedMesh(scene, "engrenageMoyen", "rouille.jpg").then(() => {
    scene.getMeshByName("engrenageMoyen").position = new Vector3(3, 0.15, 3.6);
    scene.getMeshByName("engrenageMoyen").scalingDeterminant = 0.15;
    scene.getMeshByName("engrenageMoyen").name =
      "item:engrenageMoyen:/game/pick-item";
  });
}

function verif(scene, nomItem) {
  verifItemInNavette(scene, nomItem);
}

function verifItemInNavette(scene, nomItem) {
  if (position.value === "tuyau") {
    useApi()
      .post("/game/tuyau/put-item", { item: nomItem })
      .then((res) => {
        const data = res.data;
        useAuth().user = data.user;
        useAuth().game.tuyau = data.game.tuyau;
        if (data.status === "ok") {
          putItemInNavette(scene, nomItem);
          usePopup().send(
            itemNames[nomItem] + " correctement inséré dans la capsule"
          );
        }
      })
      .catch(console.log);
  } else if (position.value === "porte") {
    useApi()
      .post("/game/porte/put-item", { item: nomItem })
      .then((res) => {
        const data = res.data;
        if (data.status === "ok") {
          useAuth().user = data.user;
          useAuth().game.portes = data.game.portes;
          putGemmeInBase(scene, nomItem);
          usePopup().send(
            "La gemme s'insère parfaitement dans l'encastrement de la porte !"
          );
        } else {
          usePopup().send(
            "Mais enfin, vous voyez bien que la gemme ne rentre pas.",
            "error"
          );
        }
      })
      .catch(console.log);
  }
}

function putItemInNavette(scene, nomItem) {
  if (nomItem === "engrenageMoyen") {
    getImportedMesh(scene, "engrenageMoyen", "rouille.jpg").then(() => {
      placeItemInNavette(scene, nomItem, 0.1);
    });
  } else if (nomItem.startsWith("gemme")) {
    getGemme(scene, nomItem.substring(5).toLowerCase()).then(() => {
      placeItemInNavette(scene, nomItem);
    });
  } else if (nomItem == "cle") {
    getImportedMesh(scene, nomItem).then(() => {
      placeItemInNavette(scene, nomItem, 1.6);
    });
  }
}

function placeItemInNavette(scene, item, scale = 1) {
  let itemMesh = scene.getMeshByName(item);
  itemMesh.position = new Vector3(4, 1.4, 1.27);
  itemMesh.rotation = new Vector3(0, 0, Math.PI / 4);
  itemMesh.scalingDeterminant = scale;
  let tubeVide = scene.getMeshByName("navetteVide");
  let couvercle = scene.getMeshByName("navetteCouvercle");
  couvercle.position = new Vector3(4.35, 1.4, 1.3);
  let navettePleine = Mesh.MergeMeshes(
    [itemMesh, tubeVide, couvercle],
    true,
    false,
    null,
    false,
    true
  );
  navettePleine.name = "navettePleine";
  return itemMesh;
}

function deleteNavette(scene) {
  let navette = scene.getMeshByName("navettePleine");
  if (navette == null) {
    navette = scene.getMeshByName("navetteVide");
    if (navette != null) {
      navette.dispose();
      scene.getMeshByName("navetteCouvercle").dispose();
    }
  } else {
    navette.dispose();
  }
}

//Apres reception socket
function deleteTrappe(scene) {
  let trappe = scene.getMeshByName("trappe");
  if (trappe) {
    trappe.dispose();
  }
}

//apres reception socket
function putItemFromTrappe(scene, item) {
  if (item.startsWith("gemme")) {
    getGemme(scene, item.substring(5).toLowerCase()).then(() => {
      placeItemFromTrappe(scene, item);
    });
  }
}

function placeItemFromTrappe(scene, item) {
  let itemMesh = scene.getMeshByName(item);
  itemMesh.position = new Vector3(-4.5, 0.1, 1.4);
  itemMesh.name = "item:" + item + ":/game/trappe/get-item";
  return itemMesh;
}

export {
  verif,
  createScene,
  placeEngInit,
  deleteNavette,
  deleteTrappe,
  putItemFromTrappe,
};
