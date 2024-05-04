<script setup>
import { ref } from "vue";
import socketio from "@/services/socketio";
import useAuth from "@/stores/auth.store";

const auth = useAuth();

const messages = ref([]);
const newMessage = ref("");

const socket = socketio.socket;

// Method to send a message
const sendMessage = () => {
  if (newMessage.value.trim() !== "") {
    socket.emit("chat/message", { message: newMessage.value });
    newMessage.value = "";
  }
};

const joinChat = () => {
  socket.emit("chat/user_join");
};

socket.on("chat/message", function (data) {
  messages.value.push({ username: data.username, text: data.message });
});

socket.on("chat/user_join", function (data) {
  messages.value.push({ text: data + " just joined the chat!" });
});

socket.on("chat/user_leave", function (data) {
  messages.value.push({ text: data + " has left the chat!" });
});

messages.value.push({ text: "You have joined the chat as " + auth.username });

setTimeout(joinChat, 500);
</script>

<template>
  <div class="section-container chat-box">
    <div class="messages-container">
      <div v-for="(message, index) in messages" :key="index">
        <span class="username" v-if="message.username">
          {{ message.username }}:
        </span>
        <span class="message" :class="{ info: !message.username }">
          {{ message.text }}
        </span>
      </div>
    </div>

    <input
      v-model="newMessage"
      @keyup.enter="sendMessage"
      placeholder="Type your message..."
    />
  </div>
</template>

<style scoped>
.chat-box {
  width: 250px;
  max-width: 250px;
  min-width: 250px;
  font-size: 0.7em;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-box input {
  font-size: 1.2em !important;
  width: 100%;
}

.messages-container {
  padding: 5px;
  background-color: rgba(51, 51, 51, 0.92);
  display: flex;
  flex-direction: column;
  gap: 1px;
  height: 200px;
  max-height: 200px;
  overflow-x: hidden;
  overflow-y: auto;
  word-break: break-word;
  width: 100%;
}

.message.info {
  color: #ffee93;
}

.username {
  font-weight: bold;
}
</style>
