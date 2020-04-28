<template>
  <div>
    <div class="loading" v-if="loading">{{ loadingText }}...</div>
    <div id="chart"></div>
  </div>
</template>

<style scoped>
#chart {
  width: 100vw;
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 1000;
}
.loading {
  position: fixed;
  width: 100vw;
  text-align: center;
  letter-spacing: 0.01em;
  top: 50vh;
  color: rgba(255, 255, 255, 0.75);
  font-family: sans-serif;
}
</style>

<script>
import axios from "axios";
import echarts from "echarts";
import { v4 as uuidv4 } from "uuid";
import { find, groupBy, orderBy } from "lodash";
import io from "socket.io-client";
import { mapGetters } from "vuex";

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
  name: "network",
  data: function() {
    return {
      chart: null
    };
  },
  watch: {
    connections() {
      this.chartUpdate();
    },
    blockchains() {
      this.chartUpdate();
    },
    relations() {
      this.chartUpdate();
    }
  },
  computed: {
    ...mapGetters(["blockchains", "connections", "relations"]),
    connectionsCountMax() {
      return Math.max(...this.connections.map(c => c.count));
    },
    loading() {
      const conn = this.connections && this.connections.length > 0;
      const block = this.blockchains && this.blockchains.length > 0;
      const rel = this.relations && Object.keys(this.relations).length > 0;
      return !(conn && block && rel);
    },
    loadingText() {
      const items = [
        "Counting stars",
        "Setting phasers to stun",
        "Reticulating splines",
        "Exploring the universe"
      ];
      return items[Math.floor(Math.random() * items.length)];
    },
    chartOptions() {
      return {
        legend: [
          {
            bottom: 80,
            left: 10,
            right: 10,
            type: "scroll",
            pageIconColor: "#fff",
            pageTextStyle: { color: "fff" },
            selectedMode: "multiple",
            textStyle: {
              color: "#fff",
              padding: 5
            },
            inactiveColor: "#fff",
            data: [...this.blockchainCategories]
          }
        ],
        series: [
          {
            zoom: 2,
            type: "graph",
            layout: "force",
            width: "100px",
            roam: true,
            nodes: [...this.addressNodes, ...this.blockchainNodes],
            links: [...this.addressLinks, ...this.blockchainLinks],
            categories: [...this.blockchainCategories],
            label: {
              formatter: "{b}",
              color: "rgba(255,255,255,.75)",
              position: "top"
            },
            force: {
              edgeLength: 5,
              repulsion: 20,
              gravity: 0.1
            }
          }
        ]
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
          symbolSize: 3,
          name: addr,
          category: this.relations[addr] || "unknown"
        };
      });
      return nodes;
    },
    addressLinks() {
      const countValues = [...new Set(this.connections.map(c => c.count))];
      const connections = orderBy(this.connections, ["count"], ["desc"]);
      return connections.map((c, index) => {
        return {
          source: c.sender,
          target: c.receiver,
          symbol: [null, "arrow"],
          symbolSize: 6,
          lineStyle: {
            color: "source",
            curveness: 0.2,
            opacity: 0.1 + countValues.indexOf(c.count) / countValues.length
          }
        };
      });
    },
    blockchainCategories() {
      let categories = this.blockchains.map(name => {
        return {
          name,
          base: name,
          itemStyle: {
            color: `#${stringToRGB(name)}`
          }
        };
      });
      const unknown = {
        name: "unknown",
        base: "unknown",
        itemStyle: {
          color: "#333"
        }
      };
      categories.push(unknown);
      return categories;
    },
    blockchainLinks() {
      return Object.keys(this.relations).map(addr => {
        return {
          source: this.relations[addr],
          target: addr,
          lineStyle: {
            color: "source",
            opacity: 0.2
          }
        };
      });
    },
    blockchainNodes() {
      return this.blockchains.map(c => {
        return {
          id: c,
          symbolSize: 15,
          category: c,
          name: c,
          label: {
            show: true,
            color: "rgba(255,255,255,.5)"
          }
        };
      });
    }
  },
  methods: {
    chartUpdate() {
      if (this.chart) {
        this.chart.setOption(this.chartOptions);
      }
    }
  },
  async mounted() {
    this.chart = echarts.init(document.getElementById("chart"));
    window.onresize = this.chart.resize;
    this.chartUpdate();
  }
};
</script>
