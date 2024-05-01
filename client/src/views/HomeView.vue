<script setup>
import { reactive } from 'vue';
import axios from 'axios';
import router from '../router';

    var form = reactive({
        nomuser:'',
        option:1,
        idSession:''
    });

    let url = 'http://localhost:3000/games/';
    let pass = ""
    let data;

    function sendForm(){
        console.log(form.nomuser)
        console.log(form.option)
        console.log(form.idSession)
        if(form.option == 1){
            pass = 'create';
            data = {username: form.nomuser,}
        } else if(form.option == 2){
            pass = 'join';
            data = {username: form.nomuser, gameId: form.idSession}
        } else {
            return;
        }
        
    axios.post(url + pass, data)
        .then(response => recupCreate(response))
        .catch(console.log)
    }

    function recupCreate(response){
        if (response.status == 200){
            console.log(response.data.token);
            localStorage.clear();
            localStorage.setItem("nom", form.nomuser)
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("gameId", response.data.game.id)
            router.push('/waiting');
        }
    }

    function addRequired(){
        document.getElementById('inputId').setAttribute('required', 'true');
    }

    function removeRequired(){
        let elinput = document.getElementById('inputId');
        if (elinput.hasAttribute('required')){
            elinput.removeAttribute('required');
        }
    }


</script>

<template>
    <h1>Welcome to YetiScape</h1>
    <form @submit.prevent="sendForm" class="divForm">
        <input v-model="form.nomuser" required="optional" placeholder="Entrez votre nom">
        <div class="divOptions">
            <input type="radio" id="op1" name="option" value="1" v-model="form.option" checked @change="removeRequired"/>
            <label for="op1" class="option">
                <span>Créer une partie privée</span>
            </label>
            <input type="radio" id="op2" name="option" value="2" v-model="form.option" @change="addRequired"/>
            <label for="op2" class="option">
                <span>Rejoindre une partie privée</span>
                <input id="inputId" v-model="form.idSession" placeholder="Entrez l'id de session" @click="(evt) => evt.currentTarget.parentElement.click()">
            </label>
            <input type="radio" id="op3" name="option" value="3" v-model="form.option" @change="removeRequired"/>
            <label for="op3" class="option">
                <span>Rejoindre une partie public<br/>(non fonctionnel)</span>
            </label>
        </div>
        <div id="confirmation">
            <button>Lancer la partie</button>
        </div>
    </form>
</template>

<style scoped>
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