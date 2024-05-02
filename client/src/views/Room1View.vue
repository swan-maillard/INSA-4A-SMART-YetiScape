<script setup>
</script>


<template>
    <body id="allScreen">
        <div id="GameScreen" class="d-flex flex-raw">
            <div id="inventaire">
            </div>
            <div id="jeu">
            </div>
        </div>
    </body>
</template>



<style scoped>
    #GameScreen {
        width: 1280px;
        height: 720px;
    }
    #inventaire {
        width:10%;
        height:100%;
    }
    #jeu {
        width:90%;
        height:100%;
    }
    div {
        border: 2px solid red;
    }
</style>