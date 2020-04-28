<template>
  <div id="chart"></div>
</template>

<style scoped>
#chart {
  width: 100vw;
  height: calc(100vh - 3rem);
}
</style>

<script>
import axios from "axios";
import ForceGraph3D from "3d-force-graph";
import { v4 as uuidv4 } from "uuid";
import { find, groupBy } from "lodash";
import io from "socket.io-client";
import { mapGetters } from "vuex";

import meshSkybox from "../functions/meshSkybox";
const API = process.env.VUE_APP_API_URL;

const stringToRGB = string => {
  const hashCode = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };
  const i = hashCode(string);
  let c = (i & 0x00ffffff).toString(16).toUpperCase();
  return "00000".substring(0, 6 - c.length) + c;
};

export default {
  name: "network3d",
  data: function() {
    return {
      txs: [],
      socket: null,
      chart: null,
      graph: null,
      graphElement: null
    };
  },
  computed: {
    ...mapGetters(["blockchains", "connections", "relations"]),
    chartData() {
      return {
        nodes: [...this.addressNodes, ...this.blockchainNodes],
        links: [...this.addressLinks, ...this.blockchainLinks]
      };
    },
    addressNodes() {
      let nodes = [];
      this.connections.forEach(c => {
        nodes.push(c.sender);
        nodes.push(c.receiver);
      });
      nodes = [...new Set(nodes)];
      nodes = nodes.map(addr => {
        return {
          id: addr,
          name: addr,
          value: addr,
          type: "address",
          color: `#${stringToRGB(this.relations[addr] || "unknown")}`
        };
      });
      return nodes;
    },
    addressLinks() {
      return this.connections.map(c => {
        return {
          source: c.sender,
          target: c.receiver,
          type: "address"
        };
      });
    },
    blockchainLinks() {
      let links = [];
      Object.keys(this.relations).forEach(addr => {
        links.push({
          source: this.relations[addr],
          target: addr,
          type: "blockchain"
        });
      });
      links = links.filter(link => {
        return find(this.addressNodes, { id: link.target });
      });
      return links;
    },
    blockchainNodes() {
      return this.blockchains.map(c => {
        return {
          id: c,
          symbolSize: 15,
          category: c,
          name: c,
          value: c,
          type: "blockchain",
          color: `#${stringToRGB(c)}`,
          label: {
            show: true,
            color: "rgba(255,255,255,.5)"
          }
        };
      });
    }
  },
  methods: {
    modifyControls(controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 3;
      controls.maxDistance = 1000;
      controls.minDistance = 100;
      controls.update();
    },
    createForceGraph3D() {
      return ForceGraph3D()
        .enableNodeDrag(false)
        .nodeAutoColorBy("color")
        .warmupTicks(100) // allow the graph to preload itself
        .cooldownTime(15000) // don't self-adjust after loading
        .nodeLabel(({ type, id }) => {
          return type === "blockchain" ? `[zone] ${id}` : id;
        })
        .nodeResolution(({ type }) => {
          return type === "address" ? 0.25 : 16;
        })
        .nodeVal(({ type }) => {
          return type === "address" ? 0.25 : 16;
        })
        .linkCurvature(({ type }) => {
          return type === "address" ? 0.25 : 0;
        })
        .linkDirectionalArrowLength(({ type }) => {
          return type === "address" ? 2 : 0;
        })
        .linkOpacity(0.25)
        .linkWidth(({ type }) => {
          return type === "address" ? 0.5 : 0.25;
        });
    }
  },
  async mounted() {
    this.graph = this.createForceGraph3D();
    this.graphElement = document.getElementById("chart");
    this.graph.scene().add(meshSkybox);
    await Promise.all([
      this.$store.dispatch("relationsFetch"),
      this.$store.dispatch("connectionsFetch"),
      this.$store.dispatch("blockchainsFetch")
    ]);
    this.graph(this.graphElement).graphData(this.chartData);
    this.modifyControls(this.graph.controls());
  }
};
</script>
