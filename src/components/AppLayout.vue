<template>
  <div>
    <div class="container">
      <app-header class="header" v-if="$route.fullPath === '/'"/>
      <keep-alive>
        <router-view />
      </keep-alive>
      <div class="navbar">
        <app-navbar />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  background: rgb(21, 21, 21);
  padding-bottom: 3rem;
}
.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
.header {
  position: absolute;
  top: 0;
  left: 0;
  margin: 2rem 0;
  z-index: 2000;
}
</style>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import AppHeader from "@/components/AppHeader.vue";

export default {
  components: {
    AppNavbar,
    AppHeader
  }
};
</script>
