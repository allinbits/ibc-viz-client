<template>
  <div>
    <div :class="['container', `position__fixed__${!!fixed}`]">
      <app-header class="header" :dark="$route.fullPath === '/3d'" />
      <keep-alive include="network,rank,network3d">
        <router-view />
      </keep-alive>
      <div class="navbar">
        <app-navbar :dark="$route.fullPath === '/3d'" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  background: rgb(21, 21, 21);
}
.position__fixed__false.container {
  padding-bottom: 3rem;
}
.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2000;
}
.position__fixed__true .header {
  position: fixed;
  z-index: 2000;
}
.position__fixed__false .header {
  position: relative;
}
</style>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import AppHeader from "@/components/AppHeader.vue";

export default {
  components: {
    AppNavbar,
    AppHeader
  },
  computed: {
    fixed() {
      return this.$route.fullPath === "/";
    }
  }
};
</script>
