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

// var urlLink = URL.createObjectURL('../assets/gears.obj');
// console.log(urlLink);
import { ref, onMounted } from "@vue/runtime-core";
import { createScene, makeEngrenageVisible } from "../scenes/room1";

function imgClick(evt) {
    var parent = evt.currentTarget.parentElement;
    parent.removeChild(evt.currentTarget);
    makeEngrenageVisible(scene);
}

const ajoutInventaire = ref(null);
function verif(x) {
    console.log('LOG:' + x);
    if (x === "engrenageMoyen"){
        var imgEngrenage = document.createElement('img')
        imgEngrenage.setAttribute('draggable', 'true');
        imgEngrenage.src = "/img/engrenageMoyen.png";
        imgEngrenage.style.width = '100%';

        //imgEngrenage.addEventListener('drop', () => console.log("dropping"));
        imgEngrenage.addEventListener('dragstart', () => console.log('start dragging'))

        var newTh = document.createElement('th');
        newTh.id = "engrenage";
        newTh.scope = "row";
        newTh.appendChild(imgEngrenage);

        var newTr = document.createElement('tr');
        newTr.appendChild(newTh);

        newTr.addEventListener('click', imgClick);

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
        document.getElementById('GameCanva').addEventListener('drop', ()=>console.log('onDropping'));
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