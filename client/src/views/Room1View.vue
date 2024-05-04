<template>
        <div id="GameScreen" class="d-flex flex-raw">
            <div id="inventaire" class="d-flex flex-col">
                <table class="table table-striped table-dark">
                    <thead class="height">
                        <tr>
                        <th scope="col">Inventaire du joueur</th>
                        </tr>
                    </thead>
                    <tbody id="ajoutInventaire">
                        
                    </tbody>
                </table>
            </div>
            <div id="jeu">
                <canvas id="GameCanva" ref="bjsCanvas"/>
            </div>
        </div>
</template>

<script>
/* eslint-disable */
import { ref, onMounted } from "@vue/runtime-core";
import { createScene, placeItem } from "../scenes/room1";

var dragElement;

function imgDrop(evt) {
    let lieu = placeItem(scene, dragElement.id)
    console.log("l'item " + dragElement.id + " a etait placé dans l'enigme : " + lieu)
    if (lieu !== "erreur") {
        ///TODO DATABASE : envoyer au serveur la sortie d'inventaire vers lieu
        var parent = dragElement.parentElement;
        parent.removeChild(dragElement);
    } else {
        console.log('impossible de drop ici');
    }
    dragElement = null;
}

function verif(type, nom) {
    console.log('verification de : ' + type + ' nommé ' + nom);
    if (type === 'item'){
        ///TODO DATABASE : mettre item nom dans l'inventaire
        let prom = new Promise((resolve, reject) => {
            if (nom === 'engrenageMoyen' || nom === 'engrenageGrand'){
                resolve();
            } else {
                reject();
            }
        }).then( () => {
            addItemToInv(nom);
        });
        return prom;
    } else if (type === 'tuyau') {
        ///TODO DATABASE : verifier que c'est OK
        let prom = new Promise((resolve, reject) => {
            if (nom == 5 /*&& itemDedans = engrenageMoyen*/){
                resolve();
            } else {
                reject();
            }
        })
        return prom;
    }
}
function addItemToInv(nom) {
    var imgEngrenage = document.createElement('img')
    imgEngrenage.setAttribute('draggable', 'true');
    imgEngrenage.src = "/img/" + nom + ".png";
    imgEngrenage.style.width = '100%';

    imgEngrenage.addEventListener('dragstart', (evt) => dragElement = evt.currentTarget.parentElement)

    var newTh = document.createElement('th');
    newTh.id = nom;
    newTh.scope = "row";
    newTh.appendChild(imgEngrenage);

    var newTr = document.createElement('tr');
    newTr.appendChild(newTh);

    document.getElementById("ajoutInventaire").appendChild(newTr);
}

var scene;
export default {
  name: "BabylonScene",
  setup() {
    const bjsCanvas = ref(null);

    onMounted(() => {
      if (bjsCanvas.value) {
        scene = createScene(bjsCanvas.value, verif);
        document.getElementById('jeu').addEventListener('dragover', (evt) => evt.preventDefault());
        document.getElementById('jeu').addEventListener('drop', imgDrop);
      }
    });

    return {
      bjsCanvas,
    };
  },
};
</script>


<style scoped>
    #GameCanva {
        height: 100%;
        width: 100%;
    }
    #GameScreen {
        width: 100%;
        height: 100%;
    }
    #inventaire {
        width:10%;
        height:100%;
    }
    #jeu {
        width:90%;
        height:100%;
    }
    img {
        width:100%;
        height:100%;
    }
</style>