<template>
<div class="m-1">
    <div class="flex justify-between">
        <p class="m-1">id de la partie : {{ idGame }}</p>
        <p class="m-1">{{ idGamer }}/3</p>
    </div>
    <div class="flex">
        <div class="card width-100" v-for="gamer in gamers" :key="gamer.id">
            <div class="">
            <h3 class="">{{gamer.name}}</h3>
            </div>
        </div>
    </div>
    <button v-if="idGamer == 3">Lancer la partie</button>
</div>
</template>

<script setup>
import { ref } from 'vue'

let idGame = 0;
let idGamer = 0;

const gamers = ref([
    {id: idGamer++, name:'Jean'},
    {id: idGamer++, name:'Marc'},
    {id: idGamer++, name:'Petit'}
]);
</script>

<style>
.card{
    border-radius: 3%;

}

.width-100{
    width: 100%;
    justify-content: center;
    text-align: center
}

.testimonial-card .card-up {
height: 120px;
overflow: hidden;
border-top-left-radius: 0.25rem;
border-top-right-radius: 0.25rem;
}

.testimonial-card .avatar {
width: 110px;
margin-top: -60px;
overflow: hidden;
border: 3px solid #fff;
border-radius: 50%;
}
</style>