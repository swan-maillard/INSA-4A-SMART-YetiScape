import { createWebHistory, createRouter } from "vue-router";

import HomeView from "./views/HomeView.vue";
import WaitingView from "./views/WaitingView.vue";
import RoomView from "./views/RoomView.vue";
import useAuth from "@/stores/auth.store";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/waiting",
      name: "waiting",
      beforeEnter: (to, from, next) => {
        const token = useAuth().token;
        if (token) next();
        else next("/");
      },
      component: WaitingView,
    },
    {
      path: "/room",
      name: "room",
      beforeEnter: (to, from, next) => {
        const token = useAuth().token;
        if (token) next();
        else next("/");
      },
      component: RoomView,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      beforeEnter: (to, from, next) => {
        next("/");
      },
      component: HomeView,
    },
  ],
});

export default router;
