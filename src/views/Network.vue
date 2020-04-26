<template>
  <div id="chart" style="width: 100vw; height: 100vh"></div>
</template>

<script>
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
  data: function() {
    return {
      txs: [],
      socket: null,
      chart: null,
      relations: {},
      blockchains: []
    };
  },
  watch: {
    txsSendPacket() {
      if (this.chart) {
        this.chart.setOption(this.chartOptions);
      }
    }
  },
  computed: {
    chartData() {
      return {
        nodes: [...this.addressNodes, ...this.blockchainNodes],
        links: [...this.addressLinks, ...this.blockchainLinks]
        // links: [...this.addressLinks]
      };
    },
    txsSendPacket() {
      return this.txs.filter(tx => {
        return find(tx.events, { type: "send_packet" });
      });
    },
    addressNodes() {
      let nodes = [];
      this.txsSendPacket.forEach(tx => {
        const send_packet = find(tx.events, { type: "send_packet" }).attributes;
        const t = JSON.parse(find(send_packet, { key: "packet_data" }).val)
          .value;
        nodes.push(t.receiver);
        nodes.push(t.sender);
      });
      const unique = [...new Set(nodes)];
      return unique.map(addr => {
        return {
          id: addr,
          val: addr,
          name: addr
        };
      });
    },
    addressLinks() {
      return this.txsSendPacket.map(t => {
        const send_packet = find(t.events, { type: "send_packet" }).attributes;
        const tx = JSON.parse(find(send_packet, { key: "packet_data" }).val)
          .value;
        return {
          source: tx.sender,
          target: tx.receiver
        };
      });
    },
    relationsAll() {
      let data = {};
      this.txs.forEach(tx => {
        Object.keys(tx.events).forEach(i => {
          const ev = tx.events[i];
          if (ev.type === "recv_packet") {
            const packet_data = find(ev.attributes, { key: "packet_data" });
            const addr = JSON.parse(packet_data.val).value.receiver;
            data[addr] = tx.domain;
          }
          if (ev.type === "send_packet") {
            const packet_data = find(ev.attributes, { key: "packet_data" });
            const addr = JSON.parse(packet_data.val).value.sender;
            data[addr] = tx.domain;
          }
        });
      });
      return { ...data, ...this.relations };
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
      let links = [];
      Object.keys(this.relationsAll).map(addr => {
        links.push({
          source: this.relationsAll[addr],
          target: addr
        });
      });
      links = links.filter(link => {
        console.log("link.target", link.target);
        return find(this.addressNodes, { id: link.target });
      });
      return links;
    },
    blockchainNodes() {
      return this.blockchains.map(c => {
        return {
          id: c,
          val: c,
          name: c,
          nodeRelSize: 16
        };
      });
    }
  },
  async mounted() {
    this.socket = io(`${API}`);
    this.socket.on("tx", tx => {
      console.log(tx);
      this.txs.push(tx);
    });
    this.txs = (await axios.get(`${API}/txs/ibc`)).data;
    this.relations = (await axios.get(`${API}/relations`)).data;
    this.blockchains = (await axios.get(`${API}/blockchains`)).data;

    console.log("blockchainLinks", this.blockchainLinks);

    let graph = ForceGraph3D().nodeAutoColorBy("group");
    graph(document.getElementById("chart")).graphData(this.chartData);
  }
};
</script>
