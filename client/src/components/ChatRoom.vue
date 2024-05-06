<script setup>
import { ref } from "vue";
import socketio from "@/services/socketio";
import useAuth from "@/stores/auth.store";

const auth = useAuth();

const messages = ref([]);
const newMessage = ref("");
const collapsed = ref(false);

const socket = socketio.socket;

// Method to send a message
const sendMessage = () => {
  if (newMessage.value.trim() !== "") {
    socket.emit("chat/message", { message: newMessage.value });
    newMessage.value = "";
  }
};

// Function to scroll to bottom of messages container
const scrollToBottom = () => {
  const messagesContainer =
    document.getElementsByClassName("messages-container");
  if (messagesContainer.length > 0) {
    messagesContainer[0].scrollTop = messagesContainer[0].scrollHeight;
  }
};

const joinChat = () => {
  socket.emit("chat/user_join");
};

socket.on("chat/message", function (data) {
  messages.value.push({ username: data.username, text: data.message });
  setTimeout(scrollToBottom, 1);
});

socket.on("chat/user_join", function (data) {
  messages.value.push({ text: data + " just joined the chat!" });
});

socket.on("chat/user_leave", function (data) {
  messages.value.push({ text: data + " has left the chat!" });
});

messages.value.push({ text: "You have joined the chat as " + auth.user.name });

setTimeout(joinChat, 500);
scrollToBottom();
</script>

<template>
  <div class="section-container chat-box" :class="{ collapsed }">
    <div class="w-100 d-flex flex-column align-items-center flex-grow-1">
      <div
        class="d-flex justify-content-between w-100 cursor-pointer"
        @click="collapsed = !collapsed"
      >
        <span></span>
        <span class="fs-5 ms-4">Chatbox</span>
        <span
          class="fs-4 me-4 d-flex align-items-center"
          style="transition: 0.5s"
          :style="!collapsed ? 'transform: rotate(180deg)' : ''"
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <polyline
              fill="none"
              points="3,15.5 12,6.5 21,15.5 "
              stroke="currentColor"
              stroke-miterlimit="10"
              stroke-width="2"
            />
          </svg>
        </span>
      </div>
      <hr />
      <div class="messages-container">
        <div v-for="(message, index) in messages" :key="index">
          <span
            class="username"
            :class="{ self: message.username === auth.user.name }"
            v-if="message.username"
          >
            {{ message.username }}:
          </span>
          <span class="message" :class="{ info: !message.username }">
            {{ message.text }}
          </span>
        </div>
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
  gap: 15px;
  max-height: 320px;
  overflow: hidden;
  transition: 0.5s;
}

.chat-box.collapsed {
  max-height: 55px;
}

.chat-box.collapsed hr {
  opacity: 0;
}

.chat-box input {
  font-size: 1.2em !important;
  width: 100%;
  border-radius: 15px !important;
  border: 1px solid #ddd;
  background-color: rgba(51, 51, 51, 0.48);
}

.messages-container {
  padding: 10px;
  background-color: rgba(51, 51, 51, 0.48);
  display: flex;
  flex-direction: column;
  gap: 1px;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  word-break: break-word;
  width: 100%;
  border-radius: 20px;
  flex-grow: 1;
}

.message {
  font-weight: bold;
}

.message.info {
  font-weight: normal;
  color: #ffd90d;
}

.username {
  color: #02acff;
  font-weight: normal;
}

.self {
  color: #f83636;
}

hr {
  opacity: 0.25;
  color: #ddd;
  width: 90%;
  margin: 0;
  margin-bottom: 10px;
}
</style>
