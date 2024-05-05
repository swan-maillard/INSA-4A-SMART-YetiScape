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
            <!-- <Room1 :dragElement="dragElement" :setDragElement="(v) => dragElement.value = v" v-if="user.salle === 1">

            </Room1>
            <Room2 v-if="user.salle === 2"/>
            <Room3 v-if="user.salle === 3
            "/> -->
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
        /*console.log("l'item " + dragElement.value.id + " a etait placé dans l'enigme : " + lieu)
        if (lieu !== "erreur") {
            ///TODO DATABASE : envoyer au serveur la sortie d'inventaire vers lieu
            var parent = dragElement.value.parentElement;
            parent.removeChild(dragElement.value);
        } else {
            console.log('impossible de drop ici');
        }*/
        dragElement.value = null;
    }
    else {
        console.log('Aucun élément sélectionné');
    }
    // let lieu = placeItem(scene, dragElement.id)
    // console.log("l'item " + dragElement.id + " a etait placé dans l'enigme : " + lieu)
    // if (lieu !== "erreur") {
    //     ///TODO DATABASE : envoyer au serveur la sortie d'inventaire vers lieu
    //     var parent = dragElement.parentElement;
    //     parent.removeChild(dragElement);
    // } else {
    //     console.log('impossible de drop ici');
    // }
    // //TODO DATABASE: téléporter vers l'autre coté de la trappe (envoyer message à user salle 1)
    // dragElement = null;
} 

function addItemToInv(nom) {
    var imgEngrenage = document.createElement('img')
    imgEngrenage.setAttribute('draggable', 'true');
    imgEngrenage.src = "/img/" + nom + ".png";
    imgEngrenage.style.width = '100%';

    imgEngrenage.addEventListener('dragstart', (evt) => { dragElement = evt.currentTarget.parentElement;})

    var newTh = document.createElement('th');
    newTh.id = nom;
    newTh.scope = "row";
    newTh.appendChild(imgEngrenage);

    var newTr = document.createElement('tr');
    newTr.appendChild(newTh);

    document.getElementById("ajoutInventaire").appendChild(newTr);
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