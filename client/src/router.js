import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from './views/HomeView.vue'
import WaitingView from './views/WaitingView.vue'

const routes = [
  { path: '/', component: WaitingView },
  { path: '/waiting', component: HomeView },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router