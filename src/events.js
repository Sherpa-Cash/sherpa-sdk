import { toHex } from "./snark-functions";
import Web3 from "web3";
import networkConfig from './networkConfig'
import { request, gql } from "graphql-request";

export const state = () => {
  return {
    latestBlockFetched: -1,
    contractAddress: null,
    depositEvents: [],
    withdrawalEvents: [],
    errorCode: null
  };
};

export const getters = {
  getDepositEventFromNote: state => note => {
    return state.depositEvents.find(
      event => event.raw_log_topics[1] === toHex(note.deposit.commitment)
    );
  },
};

export const mutations = {
  setEvents(state, { events, latestBlockFetched, contractAddress }) {
    const depositEvents = events.filter(e => e.type === 'Deposit')
    const withdrawalEvents = events.filter(e => e.type === 'Withdrawal')
    state.depositEvents = depositEvents.sort(sortEventsByLeafIndex);
    state.withdrawalEvents = withdrawalEvents.sort(sortEventsByBlockTime);
    state.contractAddress = contractAddress;
    state.latestBlockFetched = latestBlockFetched;
  },
  setError(state, errorCode) {
    state.errorCode = errorCode;
  }
};

export const actions = {
  setErrorCode({ commit }, error) {
    commit("setError", error);
  },

  async getStatisticsSubgraph({dispatch, commit, rootState}, contractAddress, chainId) {
    // dispatch('loading/enable', {message: $nuxt.$i18n.t('pages.vault.events')}, {root: true})
    const events = [];
    const contract = rootState.sherpa.contracts.find(contract => contract.contractAddress === contractAddress);
    const amnt = contract.label;
    const curr = (contract.token).toUpperCase();

    const dep = await subgraphDepositQuery(18, 0, amnt, curr, chainId);
    console.log(dep);
    const standardDepositEvents = dep
      .map(e => ({
        type: 'Deposit',
        leafIndex: parseInt(e.index),
        commitment: e.commitment,
        blockTime: new Date(parseInt(e.timestamp) * 1000).getTime(),
        txHash: e.transactionHash,
        timestamp: e.timestamp,
        dateTime: new Date(parseInt(e.timestamp) * 1000)
      }));
    events.push(...standardDepositEvents);
    const lb = dep.length > 0 ? parseInt(dep[0].blockNumber) : 0
    return { events, latestBlockFetched: lb, contractAddress}
    // commit("setEvents", { events, latestBlockFetched: lb, contractAddress});
    // dispatch('loading/disable', null, {root: true})
  },
  async getEventsSubgraph(sherpaStats, contractAddress, chainId) {
    // dispatch('loading/enable', {message: $nuxt.$i18n.t('pages.vault.events')}, {root: true})
    const events = [];
    const dep = [];
    const wit = [];
    const contract = sherpaStats.contracts.find(contract => contract.contractAddress === contractAddress);
    const amnt = contract.label;
    const curr = (contract.token).toUpperCase();
    let offset = 0;
    let depReturn;
    let witReturn;
    while (1) {
      depReturn = await subgraphDepositQuery(1000, offset, amnt, curr, chainId);
      if (depReturn.length === 0) {
        break;
      }
      dep.push(...depReturn);
      offset += 1000;
    }
    offset = 0;
    while (1) {
      witReturn = await subgraphWithdrawalQuery(1000, offset, amnt, curr, chainId);
      if (witReturn.length === 0) {
        break;
      }
      wit.push(...witReturn);
      offset += 1000
    }
    const standardDepositEvents = dep
      .map(e => ({
        type: 'Deposit',
        leafIndex: parseInt(e.index),
        commitment: e.commitment,
        blockTime: new Date(parseInt(e.timestamp) * 1000).getTime(),
        txHash: e.transactionHash,
        timestamp: e.timestamp,
        dateTime: new Date(parseInt(e.timestamp) * 1000)
      }));
    const standardWithdrawalEvents = wit
      .map(e => ({
        type: 'Withdrawal',
        to: e.to,
        nullifierHash: e.nullifier,
        fee: parseInt(e.fee),
        blockTime: new Date(parseInt(e.timestamp) * 1000).getTime(),
        txHash: e.transactionHash,
        timestamp: e.timestamp,
        dateTime: new Date(parseInt(e.timestamp) * 1000)
      }));

    events.push(...standardDepositEvents);
    events.push(...standardWithdrawalEvents);
    const db = dep[0] ? parseInt(dep[0].blockNumber) : 0;
    const wb = wit[0] ? parseInt(wit[0].blockNumber) : 0;
    const lb = Math.max(db, wb);
    return { events, latestBlockFetched: lb, contractAddress}
    // commit("setEvents", { events, latestBlockFetched: lb, contractAddress});
    // dispatch('loading/disable', null, {root: true})
  }
};

export function sortEventsByLeafIndex(a, b) {
  return a.leafIndex < b.leafIndex ? 1 : -1;
}

function sortEventsByBlockTime(a, b) {
  return a.blockTime < b.blockTime ? 1 : -1;
}

async function subgraphDepositQuery(first, offset, amnt, curr, chainId) {
  // const id = $nuxt.$config.chainId;
  const network = { ...networkConfig[`chainId${chainId}`], id: Number(chainId) };
  const APIURL = network.subgraph;
  const depQuery = gql`
    query subgraphDeposits($first: Int, $offset: Int, $curr: String, $amnt: String){
      deposits(first: $first, skip: $offset, orderBy: index, orderDirection: desc, where: { currency: $curr, amount: $amnt }){
        id
        index
        timestamp
        amount
        currency
        commitment
        blockNumber
        transactionHash
      }
    }
    `
  const variables = {
    first,
    offset,
    curr,
    amnt,
  };


  const response = await request(APIURL, depQuery, variables).catch((err) =>
    console.log(err)
  );
  return response.deposits;

}

async function subgraphWithdrawalQuery(first, offset, amnt, curr, chainId) {
  // const id = $nuxt.$config.chainId;
  const network = { ...networkConfig[`chainId${chainId}`], id: Number(chainId) };
  const APIURL = network.subgraph;
  const witQuery = gql`
    query subgraphWithdrawals($first: Int, $offset: Int, $curr: String, $amnt: String){
      withdrawals(first: $first, skip: $offset, orderBy: index, orderDirection: desc, where: { currency: $curr, amount: $amnt }){
        id
        to
        fee
        index
        amount
        currency
        nullifier
        timestamp
        blockNumber
        transactionHash
      }
    }
    `
  const variables = {
    first,
    offset,
    curr,
    amnt,
  };
  const response = await request(APIURL, witQuery, variables).catch((err) =>
    console.log(err)
  );
  return response.withdrawals;
}

function decodeThisEvent(event){
  const id = $nuxt.$config.chainId
  const network = { ...networkConfig[`chainId${id}`], id: Number(id) }
  const web3 = new Web3(network.rpcUrls.Main.url)

  return web3.eth.abi.decodeLog([
      {
        name: "to",
        type: "address",
        indexed: false
      },
      {
        name: "nullifierHash",
        type: "bytes32",
        indexed: false
      },
      {
        name: "relayer",
        type: "address",
        indexed: true
      },
      {
        name: "fee",
        type: "uint256",
        indexed: false
      }
    ],
    event.raw_log_data,
    event.raw_log_topics.slice(1),
  );
}
