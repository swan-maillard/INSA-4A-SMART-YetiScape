import { createApp } from 'vue'
import router from './router.js'
import App from './App.vue'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

createApp(App)
  .use(router)
  .mount('#app')