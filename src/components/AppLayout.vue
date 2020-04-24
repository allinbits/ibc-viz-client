<template>
  <div>
    <div class="container">
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
</style>

<script>
import AppGraph from "@/components/AppGraph.vue";
import AppSidebar from "@/components/AppSidebar.vue";
import AppNavbar from "@/components/AppNavbar.vue";

export default {
  components: {
    AppGraph,
    AppSidebar,
    AppNavbar,
  },
};
</script>
