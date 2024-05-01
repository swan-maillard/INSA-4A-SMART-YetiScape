<template>
  <div class="m-3">
    <div class="d-flex flex-row justify-content-between">
      <p class="m-1">id de la partie : {{ gameId }}</p>
      <p class="m-1">{{ gamerId }}/3</p>
    </div>

    <div class="d-flex flex-row text-center justify-content-center">
      <div class="mb-4 mb-md-0 m-4" v-for="gamer in gamers" :key="gamer.id">
        <div class="card testimonial-card">
          <div class="card-up" style="background-color: #9d789b"></div>
          <div class="avatar mx-auto bg-white">
            <img
              src="../assets/avatar_yeti.png"
              class="rounded-circle img-fluid"
            />
          </div>
          <div class="card-body">
            <h4 class="mb-4">{{ gamer.name }}</h4>
            <hr />
            <p class="dark-grey-text mt-4">
              <i class="fas fa-quote-left pe-2"></i>Un nouveau participant
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="gamerId == 3" class="flex justify-content-end mt-4">
      <button
        type="button"
        class="btn btn-primary"
        data-toggle="button"
        aria-pressed="false"
        autocomplete="off"
        @click="lancerSalle"
      >
        Démarrer la partie
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

let gameId = 0;
let gamerId = 0;
let token = localStorage.getItem("token");

const gamers = ref([]);

const config = {
  headers: {
    "Content-Type": "application/json", // Content-Type header
    Authorization: `Bearer ${token}`, // JWT token in the Authorization header
    "Access-Control-Allow-Origin": "*", // CORS header to allow requests from any origin
  },
};
infosGame();
setInterval(infosGame,1000);

function infosGame(){
  axios
  .get("http://localhost:3000/game", config)
  .then((response) => respGame(response))
  .catch(console.log);
}

function respGame(response) {
  if (response.status == 200) {
    gameId = response.data.id;

    if(response.data.users.length > gamerId && gamerId < 4){
      for(let i = gamerId; i<response.data.users.length; i++){
        gamers.value.push({id: gamerId++, name: response.data.users[i].name})
      }
    }
  }
}

function lancerSalle() {
  let userName = localStorage.getItem("nom")
  if(userName == gamers.value[0].name){
    console.log("Salle 1")
  }else if(userName == gamers.value[1].name){
    console.log("Salle 2")
  }else{
    console.log("Salle 3")
  }
}
</script>

<style>
.card {
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
