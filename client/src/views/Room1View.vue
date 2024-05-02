<template>
        <div id="GameScreen" class="d-flex flex-raw">
            <div id="inventaire" class="d-flex flex-col">
                <table class="table table-striped table-dark">
                    <thead class="height">
                        <tr>
                        <th scope="col">Inventaire du joueur</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <th id="inv1" scope="row"><img src="../../public/img/engrenageMoyen.png"/></th>
                            
                        </tr>
                        <tr>
                        <th scope="row">1</th>
                        </tr>
                        <tr>
                        <th scope="row">1</th>
                        </tr>
                        <tr>
                        <th scope="row">1</th>
                        </tr>
                        <tr>
                        <th scope="row">1</th>
                        </tr>
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


function verif(x) {
    console.log('LOG:' + x);
    if (x === "engrenageMoyen"){
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