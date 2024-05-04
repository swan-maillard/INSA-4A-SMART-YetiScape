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
import { createScene } from "../scenes/room3";

function verif(type, nom) {}

var dragElement;
function imgDrop(evt) {
    console.log('Face de pet')
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