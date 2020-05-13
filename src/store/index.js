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
    blockchains: [],
    addresses: {},
    packets: [],
  },
  getters: {
    blockchains(state) {
      return state.blockchains;
    },
    txs(state) {
      return state.txs;
    },
    addresses(state) {
      return state.addresses;
    },
    packets(state) {
      return state.packets;
    },
  },
  mutations: {
    blockchainsCreate(state, { blockchains }) {
      state.blockchains = [...new Set([...state.blockchains, ...blockchains])];
    },
    txsCreate(state, { tx }) {
      state.txs = [...state.txs, tx];
    },
    packetsCreate(state, { packet }) {
      state.packets = [...state.packets, packet];
    },
    addressesCreate(state, { address }) {
      state.addresses = { ...state.addresses, ...address };
    },
  },
  actions: {
    socketSubscribe({ dispatch, commit }) {
      let socket = io(`${API}`);
      socket.on("tx", (msg) => {
        if (
          msg.result.data &&
          msg.result.data.value &&
          msg.result.data.value.TxResult &&
          msg.result.data.value.TxResult.result &&
          msg.result.data.value.TxResult.result.events
        ) {
          const result = msg.result.data.value.TxResult;
          const tx = {
            blockchain: msg.blockchain,
            height: result.height,
            events: result.result.events.map((e) => {
              return {
                ...e,
                attributes: e.attributes.map(({ key, value }) => {
                  return {
                    key: atob(key),
                    value: atob(value),
                  };
                }),
              };
            }),
          };
          tx.events.forEach((e) => {
            if (e.type === "recv_packet") {
              e.attributes.forEach((a) => {
                if (a.key === "packet_data") {
                  const value = JSON.parse(a.value).value;
                  const packet = {
                    sender: value.sender,
                    receiver: value.receiver,
                  };
                  let address = {};
                  address[value.receiver] = tx.blockchain;
                  commit("addressesCreate", { address });
                  commit("packetsCreate", { packet });
                  // console.log("addressesCreate", address);
                  console.log("recv", tx.blockchain, e);
                }
              });
            }
            if (e.type === "send_packet") {
              e.attributes.forEach((a) => {
                if (a.key === "packet_data") {
                  const value = JSON.parse(a.value).value;
                  let address = {};
                  address[value.sender] = tx.blockchain;
                  const packet = {
                    sender: value.sender,
                    receiver: value.receiver,
                  };
                  commit("addressesCreate", { address });
                  commit("packetsCreate", { packet });
                  // console.log("addressesCreate", address);
                  console.log("send", tx.blockchain, e);
                }
              });
            }
            // e.attributes.forEach((a) => {
            //   let address = {};
            //   if (a.key === "sender") {
            //     address[a.value] = tx.blockchain;
            //     commit("addressesCreate", { address });
            //   }
            // });
          });
          // console.log(tx);
        }
      });
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
  },
});
