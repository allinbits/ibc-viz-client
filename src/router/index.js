import Vue from "vue";
import VueRouter from "vue-router";
import Network from "../views/Network.vue";
import Network3D from "../views/Network3D.vue";
import Zones from "../views/Zones.vue";
import About from "../views/About.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: Network,
  },
  {
    path: "/3d",
    component: Network3D,
  },
  {
    path: "/zones",
    component: zones,
  },
  {
    path: "/about",
    component: About,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
