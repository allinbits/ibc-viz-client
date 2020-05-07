<template>
  <div>
    <!-- <div class="loading" v-if="loading">Loading...</div> -->
    <!-- <div class="desc">Connections based on client ID and counterparty client ID.</div> -->
    <!-- <div class="dropdown">
      <div class="toolbar__container" @click="historicalToggle">
        <component
          :is="`icon-checkbox-${!!historical}`"
          class="toolbar__icon"
        />
        <div>Historical data</div>
      </div>
      <select v-model="blockchainSelected">
        <option :value="false">All blockchains</option>
        <option v-for="b in blockchains" :value="b" :key="b">{{ b }}</option>
      </select>
    </div> -->
    <div id="chart"></div>
  </div>
</template>

<style scoped>
.desc {
  color: rgba(255, 255, 255, 0.85);
  position: fixed;
  background: rgba(21, 21, 21, 0.5);
  letter-spacing: 0.02em;
  font-size: 0.875rem;
  top: 4rem;
  width: 100%;
  z-index: 2000;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
  line-height: 1.5;
}
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
  color: rgba(255, 255, 255, 0.5);
  font-family: sans-serif;
}
.toolbar__container {
  color: rgba(255, 255, 255, 0.85);
  font-family: sans-serif;
  display: inline-flex;
  align-items: center;
  flex-direction: row;
  padding: 0.25rem 0;
}
.toolbar__icon {
  fill: rgba(255, 255, 255, 0.85);
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}
.dropdown {
  position: absolute;
  top: 4rem;
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: flex-end;
  z-index: 2000;
}
.dropdown select {
  background: none;
  margin-left: 1rem;
  border: 1.25px solid rgba(255, 255, 255, 0.85);
  color: rgba(255, 255, 255, 0.85);
  outline: none;
  font-family: sans-serif;
  font-size: 1rem;
  letter-spacing: 0.01em;
  max-width: 10rem;
  border-radius: 2px;
}
</style>

<script>
import axios from "axios";
import echarts from "echarts";
import { v4 as uuidv4 } from "uuid";
import { find, groupBy, orderBy } from "lodash";
import io from "socket.io-client";
import { mapGetters } from "vuex";
import IconCheckboxTrue from "@/components/IconCheckboxTrue.vue";
import IconCheckboxFalse from "@/components/IconCheckboxFalse.vue";

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
      chart: null,
      historical: true,
      blockchainSelected: false
    };
  },
  components: {
    IconCheckboxTrue,
    IconCheckboxFalse
  },
  watch: {
    graphSize() {
      this.chartUpdate();
    },
    clientConnectionNodes() {
      this.chartUpdate();
    }
  },
  computed: {
    ...mapGetters(["blockchains", "txs", "addresses", "packets"]),
    packetsLinks() {
      return this.packets.map(p => {
        return {
          source: this.addresses[p.sender] || p.sender,
          target: this.addresses[p.receiver] || p.receiver,
          symbol: [null, "arrow"],
          symbolSize: 6,
          lineStyle: {
            color: "source",
            curveness: 0.2
          }
        };
      });
    },
    addressNodes() {
      return Object.keys(this.addresses).map(a => {
        return {
          id: a,
          symbolSize: 5,
          name: a,
          category: "unknown"
        };
      });
    },
    // clientConnectionNodes() {
    //   let data = [];
    //   Object.keys(this.createClient).forEach(key => {
    //     const source = this.createClient[key];
    //     const target = this.counterpartyClientId[key];
    //     if (target) {
    //       data.push({
    //         source,
    //         target
    //       });
    //     }
    //   });
    //   return data;
    // },
    // connectionsCountMax() {
    //   return Math.max(...this.connections.map(c => c.count));
    // },
    // loading() {
    //   const connections = this.connections && this.connections.length > 0;
    //   const blockchains = this.blockchains && this.blockchains.length > 0;
    //   return !(connections || blockchains);
    // },
    graphSize() {
      return this.blockchains.length + this.packets.length;
    },
    // blockchainTransfers() {
    //   let data = {};
    //   const transfers = this.connections.forEach(c => {
    //     const pair = `${this.relations[c.receiver]}-${
    //       this.relations[c.sender]
    //     }`;
    //     if (data[pair]) {
    //       data[pair].count = data[pair].count + c.count;
    //     } else {
    //       data[pair] = {
    //         target: this.relations[c.receiver],
    //         source: this.relations[c.sender],
    //         count: 1
    //       };
    //     }
    //   });
    //   return Object.values(data);
    // },
    chartOptions() {
      return {
        series: [
          {
            zoom: 2,
            type: "graph",
            layout: "force",
            width: "100px",
            roam: true,
            nodes: [...this.blockchainNodes, ...this.addressNodes],
            links: [...this.packetsLinks],
            // links: [...this.clientConnectionNodes],
            // links: [...this.addressLinks, ...this.blockchainLinks],
            categories: [...this.blockchainCategories],
            label: {
              formatter: "{b}",
              color: "rgba(255,255,255,.75)",
              position: "top"
            },
            force: {
              edgeLength: 50,
              repulsion: 50,
              gravity: 0.1
            }
          }
        ]
      };
    },
    // addressNodes() {
    //   let nodes = [];
    //   this.connections.forEach(c => {
    //     nodes.push(c.sender);
    //     nodes.push(c.receiver);
    //   });
    //   nodes = [...new Set(nodes)];
    //   nodes = nodes.map(addr => {
    //     return {
    //       id: addr,
    //       symbolSize: 3,
    //       name: addr,
    //       category: this.categoryCurrent(this.relations[addr] || "unknown")
    //     };
    //   });
    //   return nodes;
    // },
    // addressLinks() {
    //   const countValues = [...new Set(this.connections.map(c => c.count))];
    //   const connections = orderBy(this.connections, ["count"], ["desc"]);
    //   return connections.map((c, index) => {
    //     return {
    //       source: c.sender,
    //       target: c.receiver,
    //       symbol: [null, "arrow"],
    //       symbolSize: 6,
    //       lineStyle: {
    //         color: "source",
    //         curveness: 0.2,
    //         opacity: 0.1 + countValues.indexOf(c.count) / countValues.length
    //       }
    //     };
    //   });
    // },
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
    // blockchainLinks() {
    //   return Object.keys(this.relations).map(addr => {
    //     return {
    //       source: this.relations[addr],
    //       target: addr,
    //       lineStyle: {
    //         color: "source",
    //         opacity: 0.2
    //       }
    //     };
    //   });
    // },
    blockchainNodes() {
      return this.blockchains.map(c => {
        return {
          id: c,
          symbolSize: 10,
          category: this.categoryCurrent(c),
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
    categoryCurrent(category) {
      if (!this.blockchainSelected || this.blockchainSelected === category) {
        return category;
      } else {
        return "unknown";
      }
    },
    // historicalToggle() {
    //   if (this.historical === true) {
    //     this.$store.dispatch("connectionsClear");
    //     this.historical = false;
    //   } else {
    //     this.$store.dispatch("connectionsFetch");
    //     this.historical = true;
    //   }
    // },
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
