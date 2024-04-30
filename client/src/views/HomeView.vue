<script setup>
import { reactive } from 'vue';
import axios from 'axios';

    var form = reactive({
        nomuser:'',
        option:0,
        idSession:''
    });

    function sendForm(){
        console.log(form.nomuser)
        console.log(form.option)
        console.log(form.idSession)
        /*axios.post('http://localhost:3000/games/create', {
            username: form.nomuser,
        }, {
            headers: {
                "content-type": "text/json",
                "access-control-allow-origin": "*"
            }
        })
        .then(console.log)
        .catch(console.log)*/
        axios.get("http://localhost:3000/games")
            .then(console.log)
        .catch(console.log)
    }
</script>

<template>
    <h1>Welcome to YetiScape</h1>
    <form @submit.prevent="sendForm" class="divForm">
        <input v-model="form.nomuser" placeholder="Entrez votre nom">
        <div class="divOptions">
            <input type="radio" id="op1" name="option" value="1" v-model="form.option" checked/>
            <label for="op1" class="option">
                <span>Créer une partie privée</span>
            </label>
            <input type="radio" id="op2" name="option" value="2" v-model="form.option"/>
            <label for="op2" class="option">
                <span>Rejoindre une partie privée</span>
                <input v-model="form.idSession" placeholder="Entrez l'id de session" @click="(evt) => evt.currentTarget.parentElement.click()">
            </label>
            <input type="radio" id="op3" name="option" value="3" v-model="form.option"/>
            <label for="op3" class="option">
                <span>Rejoindre une partie public<br/>(non fonctionnel)</span>
            </label>
        </div>
        <div id="confirmation">
            <button>Lancer la partie</button>
        </div>
    </form>
</template>

<style scopped>
    .divForm {
        display: flex;
        align-self: center;
        flex-direction: column;
        align-items: center;
    }
    div {
        border: 2px solid black;
    }
    .divOptions {
        display : flex;
        flex-direction: row;
        justify-content: center;
        height: 10rem;
        justify-content: space-between;
    }
    .optionSelect{
        background-color: yellow;
    }
    input[type="radio"] {
        display:none;
    }
    input[type="radio"] + label {
        display: flex;
        flex-direction: column;
        text-align: center;
        padding: 10px;
        margin: 10px;
        border: 2px solid black;
        border-radius: 3px
    }
    input[type="radio"]:checked + label {
        border: 2px solid red;
    }
</style>