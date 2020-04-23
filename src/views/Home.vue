<template>
  <div>
    <div class="sidebar">
      <app-sidebar />
    </div>
    <div class="chart">
      <app-graph />
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  max-width: 360px;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  padding: 1rem;
  box-sizing: border-box;
  max-height: 100vh;
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-color: rgba(255, 255, 255, 0.05) rgba(255, 255, 255, 0);
  z-index: 1000;
  -webkit-overflow-scrolling: touch;
}

.sidebar::-webkit-scrollbar {
  background: rgba(255, 255, 255, 0);
  width: 8px;
}
.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.chart {
  background: #151515;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}
</style>

<script>
import AppGraph from "@/components/AppGraph.vue";
import AppSidebar from "@/components/AppSidebar.vue";

export default {
  components: {
    AppGraph,
    AppSidebar,
  },
};
</script>
