export const ethSherpaABI = [{
  "type":"function",
  "name":"isSpent",
  "inputs": [{"name":"_nullifierHash","type":"bytes32"}],
  "outputs": [{
    "internalType": "bool",
    "name": "",
    "type": "bool"
  }]
},
  {
    "type":"function",
    "name":"isKnownRoot",
    "inputs": [{"name":"_root","type":"bytes32"}],
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }]
  }
]

export const sherpaProxyABI = [{
  "type":"function",
  "name":"deposit",
  "inputs": [
    {"name":"_sherpa","type":"address"},
    {"name":"_commitment","type":"bytes32"},
    {"name":"_encryptedNote","type":"bytes"}
  ],
  "outputs": []
},
  {
    "type":"function",
    "name":"withdraw",
    "inputs": [
      {"name":"_sherpa","type":"address"},
      {"name":"_proof","type":"bytes"},
      {"name":"_root","type":"bytes32"},
      {"name":"_nullifierHash","type":"bytes32"},
      {"name":"_recipient","type":"address"},
      {"name":"_relayer","type":"address"},
      {"name":"_fee","type":"uint256"},
      {"name":"_refund","type":"uint256"},
    ],
    "outputs": []
  }
]

export const state = {

  tokens: [
    {
      id: 1,
      slug: "avax",
      label: "AVAX",
      address: null,
      decimals: 18,
      chainId: 43114
    },
    {
      id: 2,
      slug: "avax",
      label: "AVAX",
      address: null,
      decimals: 18,
      chainId: 43113
    },
    {
      id: 3,
      slug: "tsd",
      label: "TSD",
      address: "0x4fbf0429599460D327BD5F55625E30E4fC066095",
      decimals: 18,
      chainId: 43114
    },
    {
      id: 4,
      slug: "tsd",
      label: "TSD",
      address: "0xc92bd11e6ecc0a4faf9c8bb5395ebb617d7e6698",
      decimals: 18,
      chainId: 43113
    },
    {
      id: 5,
      slug: "elk",
      label: "ELK",
      address: "0xE1C110E1B1b4A1deD0cAf3E42BfBdbB7b5d7cE1C",
      decimals: 18,
      chainId: 43114
    },
  ],
  contracts: [
    {
      label: "10",
      contractAddress: "0x66F4f64f9Dce3eB1476af5E1f530228b8eD0a63f",
      contractDomain: "avax-10.sherpa.avax",
      token: "avax",
      allowance: Number.MAX_SAFE_INTEGER,
      value: 10000000000000000000,
      chainId: 43113
    },
    {
      label: "100",
      contractAddress: "0x9B247a159a0bB483098620656ADf8Bcac1365A1f",
      contractDomain: "avax-100.sherpa.avax",
      token: "avax",
      allowance: Number.MAX_SAFE_INTEGER,
      value: 100000000000000000000,
      chainId: 43113
    },
    {
      label: "500",
      contractAddress: "0x345aeAbf09Bc4Ee603af672d2De925483c35A5b0",
      contractDomain: "avax-500.sherpa.avax",
      token: "avax",
      allowance: Number.MAX_SAFE_INTEGER,
      value: 500000000000000000000,
      chainId: 43113
    },
    {
      label: "10",
      contractAddress: "0xe1376DeF383D1656f5a40B6ba31F8C035BFc26Aa",
      contractDomain: "avax-10.sherpa.avax",
      token: "avax",
      allowance: Number.MAX_SAFE_INTEGER,
      value: 10000000000000000000,
      chainId: 43114
    },
    {
      label: "100",
      contractAddress: "0x7CE57f6a5a135eb1a8e9640Af1eff9665ade00D9",
      contractDomain: "avax-100.sherpa.avax",
      token: "avax",
      allowance: Number.MAX_SAFE_INTEGER,
      value: 100000000000000000000,
      chainId: 43114
    },
    {
      label: "500",
      contractAddress: "0x6ceB170e3ec0fAfaE3Be5A02FEFb81F524FE85C5",
      contractDomain: "avax-500.sherpa.avax",
      token: "avax",
      allowance: Number.MAX_SAFE_INTEGER,
      value: 500000000000000000000,
      chainId: 43114
    },
    {
      label: "100",
      contractAddress: "0xBA00d4B0A8E9A63c3c5788908c8a93A242d26e51",
      contractDomain: "tsd-100.sherpa.avax",
      token: "tsd",
      allowance: null,
      value: 100000000000000000000,
      chainId: 43113
    },
    {
      label: "1000",
      contractAddress: "0x4F3c2d6B74b387936b25916b81348881F09c8bdf",
      contractDomain: "tsd-1000.sherpa.avax",
      token: "tsd",
      allowance: null,
      value: 1000000000000000000000,
      chainId: 43113
    },
    {
      label: "10000",
      contractAddress: "0x7409642215b43F7DDAb528004D9ae9A414190A45",
      contractDomain: "tsd-10000.sherpa.avax",
      token: "tsd",
      allowance: null,
      value: 10000000000000000000000,
      chainId: 43113
    },
    {
      label: "100",
      contractAddress: "0x0B50666bA2fE78c025ccEB014F9622eB769bee94",
      contractDomain: "tsd-100.sherpa.avax",
      token: "tsd",
      allowance: null,
      value: 100000000000000000000,
      chainId: 43114
    },
    {
      label: "1000",
      contractAddress: "0xeeE270f3F38D135Ea9Bda18fDDC205a253D02c50",
      contractDomain: "tsd-1000.sherpa.avax",
      token: "tsd",
      allowance: null,
      value: 1000000000000000000000,
      chainId: 43114
    },
    {
      label: "10000",
      contractAddress: "0x762cbdC98e64F3ABf2741AfB3781e5cBDA4DD783",
      contractDomain: "tsd-10000.sherpa.avax",
      token: "tsd",
      allowance: null,
      value: 10000000000000000000000,
      chainId: 43114
    },
    {
      label: "25",
      contractAddress: "0xbc3c7BD7328c35b2fFaD20F5899ef2581D2d2ec4",
      contractDomain: "elk-25.sherpa.avax",
      token: "elk",
      allowance: null,
      value: 25000000000000000000,
      chainId: 43114
    },
    {
      label: "250",
      contractAddress: "0x56Ac03CE9a3BEb17FD84ECef6d4D8de4070e601D",
      contractDomain: "elk-250.sherpa.avax",
      token: "elk",
      allowance: null,
      value: 250000000000000000000,
      chainId: 43114
    },
    {
      label: "500",
      contractAddress: "0x238F453A08C7A136603D40E092F150D5B35e62E2",
      contractDomain: "elk-500.sherpa.avax",
      token: "elk",
      allowance: null,
      value: 500000000000000000000,
      chainId: 43114
    },
  ],
  selectedContract: "0x66F4f64f9Dce3eB1476af5E1f530228b8eD0a63f",
  currentNote: null,
  currentCommitment: null,
  selectedToken: "avax",
  deposit: null,
  enabled: false,
  txHash: null,
  selectedView: "deposit",
  withdrawNote: null,
  withdrawNoteToken: null,
  withdrawAddress: null,
  complianceInfo: null,
  sherpaProxyContract:
    {
      fuji: "0xC0EB087ac8C732AC23c52A16627c4539d8966d79",
      mainnet: "0x171Fb28ebfFcb2737E530E1Fd48CB4Ef12E5031e"
    },
  relayerMode: true,
  relayersList: [
    {
      id: 1,
      url: "https://relayer.sherpa.entropygra.ph",
      name: 'Sherpa Relayer',
      chainId: 43114,
      fee: 1,
      status: {}
    },
    {
      id: 2,
      url: "https://relayer-fuji.sherpa.entropygra.ph",
      name: 'Sherpa Fuji Relayer',
      chainId: 43113,
      fee: 1,
      status: {}
    },
    {
      id: 3,
      url: "http://localhost:8000",
      name: 'Local Test Relayer',
      chainId: 43114,
      fee: 0.10,
      status: {}
    },
    {
      id: 4,
      url: "http://localhost:8000",
      name: 'Local Test Relayer',
      chainId: 43113,
      fee: 0.10,
      status: {}
    }
  ],
  selectedRelayerId: 1
};

export const getters = {
  getNoteContractInfo: parsedNote => {
    return state.contracts.filter(contract => {
      return (
        contract.value == parsedNote.amount && //todo changed from  contract.label === parsedNote.amount &&
        contract.token === parsedNote.currency &&
        contract.chainId === parsedNote.netId
      );
    })[0];
  },
  getSherpaProxyContract: (chainId) => {
    return (chainId == 43114)
      ? state.sherpaProxyContract.mainnet : state.sherpaProxyContract.fuji
  },
  getRelayersList: (chainId) => {
    return state.relayersList.filter(relayer => relayer.chainId === chainId);
  },
  getRelayerStatus: async (relayer) =>{
    return await (await fetch(`${relayer.url}/v1/status`)).json()
  }
};