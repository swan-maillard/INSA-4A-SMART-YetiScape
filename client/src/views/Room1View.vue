<template>
        <div id="GameScreen" class="d-flex flex-raw">
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
import { ref, onMounted, computed, watchEffect } from "@vue/runtime-core";
import { createScene, placeItem } from "../scenes/room1";
import useApi from "../stores/api.store";
import useAuth from "../stores/auth.store";

const bjsCanvas = ref(null);
const {user} = useAuth();
const inventaire = computed(() => useAuth().user.items);
const itemsDispo = computed(() => useAuth().game.itemsDispo);
const dragElement = ref(null);
let scene;

watchEffect(() =>  {
    console.log('Inventaire: ', inventaire.value);
    console.log('Items Dispo: ', itemsDispo.value);
})

onMounted(() => {
    if (bjsCanvas.value) {
        scene = createScene(bjsCanvas.value, verif);
    }
});

function imgDrop() {
    console.log('elem : ' + dragElement.value)
    if (dragElement.value) {
        let lieu = placeItem(scene, dragElement.value.id)
        console.log("l'item " + dragElement.value.id + " a etait placé dans l'enigme : " + lieu)
        if (lieu !== "erreur") {
            ///TODO DATABASE : envoyer au serveur la sortie d'inventaire vers lieu
            var parent = dragElement.value.parentElement;
            parent.removeChild(dragElement.value);
        } else {
            console.log('impossible de drop ici');
        }
        dragElement.value = null;
    }
    else {
        console.log('Aucun élément sélectionné');
    }
    
}

function verif(type, nom) {
    console.log('verification de : ' + type + ' nommé ' + nom);
    if (type === 'item'){
        return useApi().post('/game/pick-item', {item: nom})
        .then(res => {
            const data = res.data;
            if (data.status === 'ok') {
                useAuth().user = data.user;
                useAuth().game.itemsDispo = data.game.itemsDispo;
            }
        })
        .catch(console.log);
    } else if (type === 'tuyau') {
        ///TODO DATABASE : verifier que c'est OK
        let prom = new Promise((resolve, reject) => {
            if (nom == 5 /*&& itemDedans = engrenageMoyen*/){
                resolve();
            } else {
                //addItemToInv('engrenageMoyen');
                reject();
            }
        })
        return prom;
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