<template>
<div class="m-3">
    <div class="d-flex flex-row justify-content-between">
        <p class="m-1">id de la partie : {{ gameId }}</p>
        <p class="m-1">{{ gamerId }}/3</p>
    </div>
        
    <div class="d-flex flex-row text-center justify-content-center">
        <div class=" mb-4 mb-md-0 m-4" v-for="gamer in gamers" :key="gamer.id">
        <div class="card testimonial-card">
            <div class="card-up" style="background-color: #9d789b;"></div>
            <div class="avatar mx-auto bg-white">
            <img src="../assets/avatar_yeti.png"
                class="rounded-circle img-fluid" />
            </div>
            <div class="card-body">
            <h4 class="mb-4">{{gamer.name}}</h4>
            <hr />
            <p class="dark-grey-text mt-4">
                <i class="fas fa-quote-left pe-2"></i>Un nouveau participant 
            </p>
            </div>
        </div>
        </div>
    </div>
    <div v-if="gamerId == 3" class="flex justify-content-end mt-4">
        <button type="button" class="btn btn-primary" data-toggle="button" aria-pressed="false" autocomplete="off">
            Démarrer la partie
        </button>
    </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios';


let gameId = 0;
let gamerId = 0;
let token = 'Bearer '+ localStorage.getItem("token");
console.log(token)

const gamers = ref([
]);

axios.get("http://localhost:3000/game",{
    headers:{
        'Autorization': token,
    }
})
        .then(response => infosGame(response))
        .catch(console.log)

function infosGame(response){
    if(response.status == 200){
        gameId = response.data;
        console.log(gameId)
        // let users = response.data.filter((game) => game.id == gameId)
        // console.log(response.data)
        // console.log(users)
        // game.users.forEach((user) => {
        //     gamers.value.push({id: gamerId++, name: user})
        // });
        // console.log(gamers)
    }
}
</script>

<style>
.card{
    width: 15rem;
}
.testimonial-card .card-up {
height: 90px;
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