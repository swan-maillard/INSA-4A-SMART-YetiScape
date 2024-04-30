<script setup>
import { reactive } from 'vue';
    var form = reactive({
        nomuser:'',
        option:0,
        idSession:''
    });
    function sendForm(){
        console.log(form.nomuser)
        console.log(form.option)
        console.log(form.idSession)
    }
</script>

<template>
    <h1>Welcome to YetiScape</h1>
    <form @submit.prevent="sendForm" class="divForm">
        <input v-model="form.nomuser" placeholder="Entrez votre nom">
        <div class="divOptions">
            <input type="radio" id="op1" name="option" value="1" v-model="form.option" />
            <label for="op1">
                <div class="option">
                    <span>Créer une partie privée</span>
                </div>
            </label>
            <input type="radio" id="op2" name="option" value="2" v-model="form.option" />
            <label for="op2">
                <div class="option">
                    <span>Rejoindre une partie privée</span>
                    <input v-model="form.idSession" placeholder="Entrez l'id de session">
                </div>
            </label>
            <input type="radio" id="op3" name="option" value="3" v-model="form.option" />
            <label for="op3">
                <div class="option">
                    <span>Rejoindre une partie public<br/>(non fonctionnel)</span>
                </div>
            </label>
        </div>
        <div id="confirmation">
            <button>Lancer la partie</button>
        </div>
    </form>
</template>

<style>
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
    .option {
        display:flex;
        flex-direction: column;
        text-align: center;
        padding: 10px;
        margin: 10px; 
    }
    .option:hover{
        border: 3px solid red;
    }
    .optionSelect{
        background-color: yellow;
    }

</style>