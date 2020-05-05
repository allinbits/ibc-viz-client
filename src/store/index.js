import Vue from "vue";
import Vuex from "vuex";
import io from "socket.io-client";
import axios from "axios";
import { find, findIndex } from "lodash";

Vue.use(Vuex);

const API = process.env.VUE_APP_API_URL;

export const store = new Vuex.Store({
  strict: true,
  state: {
    txs: [],
    relations: {},
    blockchains: [],
    connections: [],
    counterpartyClientId: {},
    createClient: {},
  },
  getters: {
    blockchains(state) {
      return state.blockchains;
    },
    counterpartyClientId(state) {
      return state.counterpartyClientId;
    },
    createClient(state) {
      return state.createClient;
    },
    relations(state) {
      const relations = {};
      state.connections.forEach((c) => {
        if (c.type === "send_packet") {
          relations[c.sender] = c.blockchain;
        }
        if (c.type === "recv_packet") {
          relations[c.receiver] = c.blockchain;
        }
      });
      return { ...relations, ...state.relations };
    },
    connections(state) {
      return state.connections;
    },
  },
  mutations: {
    connectionsUpdate(state, { index, connections }) {
      connections.forEach((connection) => {
        const index = findIndex(state.connections, {
          sender: connection.sender,
          receiver: connection.receiver,
        });
        if (index >= 0) {
          Vue.set(state.connections, index, connection);
        } else {
          state.connections = [...state.connections, connection];
        }
      });
    },
    connectionsClear(state) {
      state.connections = [];
    },
    blockchainsCreate(state, { blockchains }) {
      state.blockchains = [...new Set([...state.blockchains, ...blockchains])];
    },
    relationsCreate(state, { relations }) {
      state.relations = { ...state.relations, ...relations };
    },
    counterpartyClientIdCreate(state, { counterpartyClientId }) {
      state.counterpartyClientId = {
        ...state.counterpartyClientId,
        ...counterpartyClientId,
      };
    },
    createClientCreate(state, { createClient }) {
      state.createClient = { ...state.createClient, ...createClient };
    },
  },
  actions: {
    connectionsUpsert({ state, commit }, tx) {
      const connection = {
        sender: tx.sender,
        receiver: tx.receiver,
        blockchain: tx.blockchain,
        type: tx.type,
      };
      const existing = find(state.connections, connection);
      if (existing) {
        commit("connectionsUpdate", {
          connections: [{ ...existing, count: existing.count + 1 }],
        });
      } else {
        commit("connectionsUpdate", {
          connections: [{ ...connection, count: 1 }],
        });
      }
    },
    socketSubscribe({ dispatch }) {
      let socket = io(`${API}`);
      socket.on("tx", (tx) => {
        if (tx.type === "send_packet") {
          dispatch("connectionsUpsert", tx);
        }
      });
      socket.on("all", (tx) => {
        console.log(tx);
      });
    },
    async relationsFetch({ commit }) {
      return new Promise(async (resolve) => {
        const url = `${API}/relations`;
        const relations = (await axios.get(url)).data;
        commit("relationsCreate", { relations });
        resolve(true);
      });
    },
    async connectionsFetch({ commit }) {
      return new Promise(async (resolve) => {
        const url = `${API}/connections`;
        const connections = (await axios.get(url)).data;
        commit("connectionsUpdate", { connections });
        resolve(true);
      });
    },
    connectionsClear({ commit }) {
      commit("connectionsClear");
    },
    async blockchainsFetch({ commit }) {
      return new Promise(async (resolve) => {
        const url = `${API}/blockchains`;
        let blockchains = (await axios.get(url)).data;
        blockchains = blockchains.map((b) => {
          return b.node_addr.split(":")[0];
        });
        commit("blockchainsCreate", { blockchains });
        resolve(true);
      });
    },
    async counterpartyClientIdFetch({ commit }) {
      return new Promise(async (resolve) => {
        const url = `${API}/counterparty_client_id`;
        let counterpartyClientId = (await axios.get(url)).data;
        commit("counterpartyClientIdCreate", { counterpartyClientId });
        resolve(true);
      });
    },
    async createClientFetch({ commit }) {
      return new Promise(async (resolve) => {
        const url = `${API}/create_client`;
        let createClient = (await axios.get(url)).data;
        commit("createClientCreate", { createClient });
        resolve(true);
      });
    },
  },
});
