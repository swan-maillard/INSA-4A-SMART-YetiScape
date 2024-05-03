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
import { createScene, makeEngrenageVisible } from "../scenes/room2";

var dragElement;

function imgDrop(evt) {
    console.log('dropping a element');
    let bon = makeEngrenageVisible(scene, dragElement.id);
    if (bon == true) {
        var parent = dragElement.parentElement;
        parent.removeChild(dragElement);
    } else {
        console.log('impossible de drop ici');
    }
    dragElement = null;
}

const ajoutInventaire = ref(null);
function verif(item) {
    console.log('LOG:' + item);
    if (item === "engrenageGrand"){
        var imgEngrenage = document.createElement('img')
        imgEngrenage.setAttribute('draggable', 'true');
        imgEngrenage.src = "/img/engrenageGrand.png";
        imgEngrenage.style.width = '100%';

        imgEngrenage.addEventListener('dragstart', (evt) => dragElement = evt.currentTarget.parentElement)

        var newTh = document.createElement('th');
        newTh.id = item;
        newTh.scope = "row";
        newTh.appendChild(imgEngrenage);

        var newTr = document.createElement('tr');
        newTr.appendChild(newTh);

        document.getElementById("ajoutInventaire").appendChild(newTr);

        return true;
    } else {
        return false;
    }
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