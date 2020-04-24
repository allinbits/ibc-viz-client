<template>
  <div>
    <div class="container">
      <app-graph />
    </div>
  </div>
</template>

<style scoped>
.chart {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
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
