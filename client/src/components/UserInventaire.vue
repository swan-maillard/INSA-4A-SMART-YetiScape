<script setup>
import useAuth from "@/stores/auth.store";
import { computed } from "@vue/runtime-core";
import { storeToRefs } from "pinia";
import { itemNames } from "./items";

const { user, game, elementGrabbed } = storeToRefs(useAuth());
const items = computed(() => user.value.items || []);
</script>

<template>
  <div v-if="game.hasStarted" class="section-container inventaire">
    <span class="fs-5"
      >Inventaire de <b>{{ user.name }}</b></span
    >
    <hr />
    <div
      class="d-flex flex-column gap-2 align-items-center w-100 overflow-auto"
    >
      <div
        class="item d-flex gap-3 align-items-center"
        v-for="item in items"
        :key="item"
      >
        <img
          :id="item"
          draggable="true"
          :src="'/img/' + item + '.png'"
          style="width: 60px"
          @dragstart="(e) => (elementGrabbed = e.currentTarget)"
          @dragend="elementGrabbed = null"
          alt="Item"
        />
        <span>{{ itemNames[item] }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inventaire {
  width: 250px;
  max-width: 250px;
  min-width: 250px;
  font-size: 0.8em;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

hr {
  opacity: 0.25;
  color: #ddd;
  width: 90%;
  margin: 0;
  margin-bottom: 10px;
}

.item {
  width: 100%;
  background-color: rgba(51, 51, 51, 0.48);
  border-radius: 20px;
  padding: 5px 10px;
}

.item img {
  cursor: grab;
}
</style>
