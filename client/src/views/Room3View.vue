<template>
    <div v-if="user" id="GameScreen" class="d-flex flex-raw">
        <div id="inventaire" class="d-flex flex-col">
            <table class="table table-striped table-dark">
                <thead class="height">
                    <tr>
                    <th scope="col">Inventaire du joueur </th>
                    </tr>
                </thead>
                <tbody id="ajoutInventaire">
                    <tr v-for="item in inventaire" :key="item">
                        <th :id="item" scope="row">
                            <img draggable="true" :src="'/img/'+item+'.png'" style="width: 100%;" @dragstart="(evt) => dragElement = evt.currentTarget.parentElement">
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="jeu" @drop="imgDrop" @dragover.prevent>
            <canvas id="GameCanva" ref="bjsCanvas"/>
        </div>
    </div>
</template>

<script setup>
/* eslint-disable */
import { ref, computed, watchEffect  } from "@vue/runtime-core";
import { createScene, verifItemTrappe } from "../scenes/room3";
import useApi from "../stores/api.store";
import useAuth from "../stores/auth.store";

const bjsCanvas = ref(null);
const canvaMounted = ref(false)
const auth = useAuth();
const user = computed(() => useAuth().user);
const inventaire = computed(() => useAuth().user.items);
const itemsDispo = computed(() => useAuth().game.itemsDispo);
const dragElement = ref(null);
let scene;

watchEffect(() => {
    if (!canvaMounted.value && bjsCanvas.value) {
        canvaMounted.value = true;
        console.log('mount canva')
        scene = createScene(bjsCanvas.value);
    }
}, [bjsCanvas])

function imgDrop(evt) {
    console.log('elem : ' + dragElement.value)
    if (dragElement.value) {
        verifItemTrappe(scene, dragElement.value.id)
        dragElement.value = null;
    }
    else {
        console.log('Aucun élément sélectionné');
    }
} 

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