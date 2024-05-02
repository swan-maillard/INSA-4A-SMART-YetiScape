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
import { createScene } from "../scenes/room1";

const ajoutInventaire = ref(null);
function verif(x) {
    console.log('LOG:' + x);
    if (x === "engrenageMoyen"){
        var imgEngrenage = document.createElement('img')
        imgEngrenage.src = "/img/engrenageMoyen.png";
        imgEngrenage.style.width = '100%';

        var newTh = document.createElement('th');
        newTh.id = "engrenage";
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

export default {
  name: "BabylonScene",
  setup() {
    const bjsCanvas = ref(null);

    onMounted(() => {
      if (bjsCanvas.value) {
        createScene(bjsCanvas.value, verif);
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