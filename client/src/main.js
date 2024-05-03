import { createApp } from 'vue'
import router from './router.js'
import App from './App.vue'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import socketio from './services/socketio.js'

socketio.setupSocketConnection()
socketio.join();

//Export the socket to use it to connect????? since we init it here. Ask @Swan
export default socketio

createApp(App)
  .use(router)
  .mount('#app')