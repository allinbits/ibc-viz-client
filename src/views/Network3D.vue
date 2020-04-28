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
import meshSkybox from "../functions/meshSkybox";

import axios from "axios";
import ForceGraph3D from "3d-force-graph";
import { v4 as uuidv4 } from "uuid";
import { find, groupBy } from "lodash";
import io from "socket.io-client";

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
      relations: {},
      blockchains: [],
      connections: []
    };
  },
  computed: {
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
    }
  },
  async mounted() {
    this.relations = (await axios.get(`${API}/relations`)).data;
    this.blockchains = (await axios.get(`${API}/blockchains`)).data;
    this.connections = (await axios.get(`${API}/transfers/connections`)).data;

    let distance = 500;

    let graph = ForceGraph3D()
      .enableNodeDrag(false)
      .nodeAutoColorBy("color")
      .warmupTicks(100) // allow the graph to preload itself
      .cooldownTime(15000) // don't self-adjust after loading
      .nodeLabel(node => {
        if (node.type === "blockchain") {
          return `[zone] ${node.id}`;
        }
        return node.id;
      })
      .nodeResolution(node => {
        if (node.type === "address") {
          return 0.25;
        }
        return 16;
      })
      .nodeVal(node => {
        if (node.type === "address") {
          return 0.25;
        }
        return 16;
      })
      .linkCurvature(link => {
        if (link.type === "address") {
          return 0.25;
        }
        return 0;
      })
      .linkDirectionalArrowLength(link => {
        if (link.type === "address") {
          return 2;
        }
        return 0;
      })
      .linkOpacity(0.25)
      .linkWidth(link => {
        if (link.type === "address") {
          return 0.5;
        }
        return 0.25;
      });

    graph(document.getElementById("chart")).graphData(this.chartData);
    graph.scene().add(meshSkybox);
    this.modifyControls(graph.controls());
    this.socket = io(`${API}`);
    this.socket.on("tx", tx => {
      if (tx.type === "send_packet") {
        let c = find(this.connections, {
          sender: tx.sender,
          receiver: tx.receiver
        });
        if (c) {
          c.count++;
        } else {
          this.connections.push({
            sender: tx.sender,
            receiver: tx.receiver,
            count: 1
          });
        }
      }
      graph.numDimensions(3);
    });
  }
};
</script>
