<template>
  <div>
    <div class="wrapper">
      <transition name="zoom">
        <div class="container" v-if="show">
          <div class="p">This is a live visualization of the current Game of Zones testnet, built by a team at All in Bits Inc.</div>
          <div class="p">The large circles are sovereign blockchains, and the lines are inter-blockchain transactions.</div>
          <a class="button" target="_blank" rel="noopener" href="https://goz.cosmosnetwork.dev/">Learn more about GoZ →</a>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  margin: 13vh 1rem 0;
}
.container {
  padding: 2rem;
  background: white;
  max-width: 400px;
  margin: 0 auto;
  border-radius: 0.5rem;
  font-family: sans-serif;
  color: rgba(0, 0, 0, 0.9);
}
.p {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}
.button {
  margin-top: 1rem;
  display: block;
  background: #5064fb;
  color: white;
  text-align: center;
  padding: 1rem 0.5rem;
  text-decoration: none;
  border-radius: 0.25rem;
  user-select: none;
  transform: opacity 0.1s;
}
.button:active {
  opacity: 0.8;
}
.zoom-enter {
  opacity: 0;
  transform: scale(0.95);
}
.zoom-enter-active {
  transition: opacity 0.25s, transform 0.75s;
}
.zoom-enter-to {
  opacity: 1;
  transform: scale(1);
}
</style>

<script>
export default {
  data: function() {
    return {
      show: null
    };
  },
  mounted() {
    this.show = true;
  }
};
</script>