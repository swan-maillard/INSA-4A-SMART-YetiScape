import { createApp } from "vue";
import router from "./router.js";
import App from "./App.vue";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import socketio from "./services/socketio.js";
import { createPinia } from "pinia";

socketio.setupSocketConnection();

const pinia = createPinia();

const app = createApp(App);

app.use(pinia);
app.use(router);
app.mount("#app");
