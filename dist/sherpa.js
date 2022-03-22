var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// node_modules/tsup/assets/cjs_shims.js
var init_cjs_shims = __esm({
  "node_modules/tsup/assets/cjs_shims.js"() {
  }
});

// src/lib/Storage.js
var require_Storage = __commonJS({
  "src/lib/Storage.js"(exports, module2) {
    init_cjs_shims();
    var JsStorage = class {
      constructor() {
        this.db = {};
      }
      get(key) {
        return this.db[key];
      }
      get_or_element(key, defaultElement) {
        const element = this.db[key];
        if (element === void 0) {
          return defaultElement;
        } else {
          return element;
        }
      }
      put(key, value) {
        if (key === void 0 || value === void 0) {
          throw Error("key or value is undefined");
        }
        this.db[key] = value;
      }
      del(key) {
        delete this.db[key];
      }
      put_batch(key_values) {
        key_values.forEach((element) => {
          this.db[element.key] = element.value;
        });
      }
    };
    module2.exports = JsStorage;
  }
});

// src/lib/MiMC.js
var require_MiMC = __commonJS({
  "src/lib/MiMC.js"(exports, module2) {
    init_cjs_shims();
    var circomlib2 = require("circomlib");
    var mimcsponge = circomlib2.mimcsponge;
    var snarkjs = require("snarkjs");
    var bigInt2 = snarkjs.bigInt;
    var MimcSpongeHasher = class {
      hash(level, left, right) {
        return mimcsponge.multiHash([bigInt2(left), bigInt2(right)]).toString();
      }
    };
    module2.exports = MimcSpongeHasher;
  }
});

// src/lib/merkleTree.js
var require_merkleTree = __commonJS({
  "src/lib/merkleTree.js"(exports, module2) {
    init_cjs_shims();
    var jsStorage = require_Storage();
    var hasherImpl = require_MiMC();
    var MerkleTree = class {
      constructor(n_levels, defaultElements, prefix, storage, hasher) {
        this.prefix = prefix;
        this.storage = storage || new jsStorage();
        this.hasher = hasher || new hasherImpl();
        this.n_levels = n_levels;
        this.zero_values = [];
        this.totalElements = 0;
        let current_zero_value = "21663839004416932945382355908790599225266501822907911457504978515578255421292";
        this.zero_values.push(current_zero_value);
        for (let i = 0; i < n_levels; i++) {
          current_zero_value = this.hasher.hash(i, current_zero_value, current_zero_value);
          this.zero_values.push(current_zero_value.toString());
        }
        if (defaultElements) {
          let level = 0;
          this.totalElements = defaultElements.length;
          defaultElements.forEach((element, i) => {
            this.storage.put(MerkleTree.index_to_key(prefix, level, i), element);
          });
          level++;
          let numberOfElementsInLevel = Math.ceil(defaultElements.length / 2);
          for (level; level <= this.n_levels; level++) {
            for (let i = 0; i < numberOfElementsInLevel; i++) {
              const leftKey = MerkleTree.index_to_key(prefix, level - 1, 2 * i);
              const rightKey = MerkleTree.index_to_key(prefix, level - 1, 2 * i + 1);
              const left = this.storage.get(leftKey);
              const right = this.storage.get_or_element(rightKey, this.zero_values[level - 1]);
              const subRoot = this.hasher.hash(null, left, right);
              this.storage.put(MerkleTree.index_to_key(prefix, level, i), subRoot);
            }
            numberOfElementsInLevel = Math.ceil(numberOfElementsInLevel / 2);
          }
        }
      }
      static index_to_key(prefix, level, index) {
        const key = `${prefix}_tree_${level}_${index}`;
        return key;
      }
      async root() {
        let root = await this.storage.get_or_element(MerkleTree.index_to_key(this.prefix, this.n_levels, 0), this.zero_values[this.n_levels]);
        return root;
      }
      async path(index) {
        class PathTraverser {
          constructor(prefix, storage, zero_values) {
            this.prefix = prefix;
            this.storage = storage;
            this.zero_values = zero_values;
            this.path_elements = [];
            this.path_index = [];
          }
          async handle_index(level, element_index, sibling_index) {
            const sibling = await this.storage.get_or_element(MerkleTree.index_to_key(this.prefix, level, sibling_index), this.zero_values[level]);
            this.path_elements.push(sibling);
            this.path_index.push(element_index % 2);
          }
        }
        index = Number(index);
        let traverser = new PathTraverser(this.prefix, this.storage, this.zero_values);
        const root = await this.storage.get_or_element(MerkleTree.index_to_key(this.prefix, this.n_levels, 0), this.zero_values[this.n_levels]);
        const element = await this.storage.get_or_element(MerkleTree.index_to_key(this.prefix, 0, index), this.zero_values[0]);
        await this.traverse(index, traverser);
        return {
          root,
          path_elements: traverser.path_elements,
          path_index: traverser.path_index,
          element
        };
      }
      async update(index, element, insert = false) {
        if (!insert && index >= this.totalElements) {
          throw Error("Use insert method for new elements.");
        } else if (insert && index < this.totalElements) {
          throw Error("Use update method for existing elements.");
        }
        try {
          class UpdateTraverser {
            constructor(prefix, storage, hasher, element2, zero_values) {
              this.prefix = prefix;
              this.current_element = element2;
              this.zero_values = zero_values;
              this.storage = storage;
              this.hasher = hasher;
              this.key_values_to_put = [];
            }
            async handle_index(level, element_index, sibling_index) {
              if (level == 0) {
                this.original_element = await this.storage.get_or_element(MerkleTree.index_to_key(this.prefix, level, element_index), this.zero_values[level]);
              }
              const sibling = await this.storage.get_or_element(MerkleTree.index_to_key(this.prefix, level, sibling_index), this.zero_values[level]);
              let left, right;
              if (element_index % 2 == 0) {
                left = this.current_element;
                right = sibling;
              } else {
                left = sibling;
                right = this.current_element;
              }
              this.key_values_to_put.push({
                key: MerkleTree.index_to_key(this.prefix, level, element_index),
                value: this.current_element
              });
              this.current_element = this.hasher.hash(level, left, right);
            }
          }
          let traverser = new UpdateTraverser(this.prefix, this.storage, this.hasher, element, this.zero_values);
          await this.traverse(index, traverser);
          traverser.key_values_to_put.push({
            key: MerkleTree.index_to_key(this.prefix, this.n_levels, 0),
            value: traverser.current_element
          });
          await this.storage.put_batch(traverser.key_values_to_put);
        } catch (e) {
          console.error(e);
        }
      }
      async insert(element) {
        const index = this.totalElements;
        await this.update(index, element, true);
        this.totalElements++;
      }
      async traverse(index, handler) {
        let current_index = index;
        for (let i = 0; i < this.n_levels; i++) {
          let sibling_index = current_index;
          if (current_index % 2 == 0) {
            sibling_index += 1;
          } else {
            sibling_index -= 1;
          }
          await handler.handle_index(i, current_index, sibling_index);
          current_index = Math.floor(current_index / 2);
        }
      }
      getIndexByElement(element) {
        for (let i = this.totalElements - 1; i >= 0; i--) {
          const elementFromTree = this.storage.get(MerkleTree.index_to_key(this.prefix, 0, i));
          if (elementFromTree === element) {
            return i;
          }
        }
        return false;
      }
    };
    module2.exports = MerkleTree;
  }
});

// src/sherpa.js
var sherpa_exports = {};
__export(sherpa_exports, {
  SherpaSDK: () => SherpaSDK
});
init_cjs_shims();

// src/snark-functions.js
init_cjs_shims();
var randomBytes = require("crypto").randomBytes;
var circomlib = require("circomlib");
var { bigInt } = require("snarkjs");
var assert = require("assert");
var buildGroth16 = require("websnark/src/groth16");
var websnarkUtils = require("websnark/src/utils");
var merkleTree = require_merkleTree();
var MERKLE_TREE_HEIGHT = 20;
var rbigint = (nbytes) => bigInt.leBuff2int(randomBytes(nbytes));
function pedersenHash(data) {
  console.log("pedersen data");
  return circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0];
}
function toHex(number, length = 32) {
  const str = number instanceof Buffer ? number.toString("hex") : bigInt(number).toString(16);
  return "0x" + str.padStart(length * 2, "0");
}
function getNoteStringAndCommitment(currency, amount, netId) {
  const nullifier = rbigint(31);
  const secret = rbigint(31);
  const preimage = Buffer.concat([
    nullifier.leInt2Buff(31),
    secret.leInt2Buff(31)
  ]);
  console.log("preimage", preimage);
  let commitment = pedersenHash(preimage);
  console.log("commitment", commitment);
  const note = toHex(preimage, 62);
  const noteString = `sherpa-${currency}-${amount}-${netId}-${note}`;
  commitment = toHex(commitment);
  return { noteString, commitment };
}
function parseNote(noteString) {
  const noteRegex = /sherpa-(?<currency>\w+)-(?<amount>[\d.]+)-(?<netId>\d+)-0x(?<note>[0-9a-fA-F]{124})/g;
  const match = noteRegex.exec(noteString);
  if (!match) {
    throw new Error("The note has invalid format" + JSON.stringify(noteString));
  }
  const buf = Buffer.from(match.groups.note, "hex");
  const nullifier = bigInt.leBuff2int(buf.slice(0, 31));
  const secret = bigInt.leBuff2int(buf.slice(31, 62));
  const deposit = createDeposit({ nullifier, secret });
  const netId = Number(match.groups.netId);
  return {
    currency: match.groups.currency,
    amount: match.groups.amount,
    netId,
    deposit
  };
}
function createDeposit({ nullifier, secret }) {
  let deposit = { nullifier, secret };
  deposit.preimage = Buffer.concat([
    deposit.nullifier.leInt2Buff(31),
    deposit.secret.leInt2Buff(31)
  ]);
  deposit.commitment = pedersenHash(deposit.preimage);
  deposit.commitmentHex = toHex(deposit.commitment);
  deposit.nullifierHash = pedersenHash(deposit.nullifier.leInt2Buff(31));
  deposit.nullifierHex = toHex(deposit.nullifierHash);
  return deposit;
}
async function generateMerkleProofSherpa(events, deposit, contract) {
  const leaves = events.map((e) => e.commitment);
  const tree = new merkleTree(MERKLE_TREE_HEIGHT, leaves.reverse());
  const depositEvent = events.find((e) => e.commitment === toHex(deposit.commitment));
  const leafIndex = depositEvent ? depositEvent.leafIndex : -1;
  const isValidRoot = await contract.methods.isKnownRoot(toHex(await tree.root())).call();
  console.log("isValidRoot", isValidRoot);
  const isSpent = await contract.methods.isSpent(toHex(deposit.nullifierHash)).call();
  assert(isValidRoot === true, "Merkle tree is corrupted");
  assert(isSpent === false, "The note is already spent");
  assert(leafIndex >= 0, "The deposit is not found in the tree");
  return tree.path(leafIndex);
}
async function generateProofSherpa(contract, deposit, recipient, events, circuit, provingKey, relayer = 0, fee = 0, refund = 0) {
  const { root, path_elements, path_index } = await generateMerkleProofSherpa(events, deposit, contract);
  const input = {
    root,
    nullifierHash: deposit.nullifierHash,
    recipient: bigInt(recipient),
    relayer: bigInt(relayer),
    fee: bigInt(fee),
    refund: bigInt(refund),
    nullifier: deposit.nullifier,
    secret: deposit.secret,
    pathElements: path_elements,
    pathIndices: path_index
  };
  const groth16 = await buildGroth16();
  console.log("Generating SNARK proof");
  console.time("Proof time");
  const proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, provingKey);
  const { proof } = websnarkUtils.toSolidityInput(proofData);
  console.timeEnd("Proof time");
  const args = [
    toHex(input.root),
    toHex(input.nullifierHash),
    toHex(input.recipient, 20),
    toHex(input.relayer, 20),
    toHex(input.fee),
    toHex(input.refund)
  ];
  const extraArgs = [deposit.nullifier, deposit.secret, path_elements, path_index];
  return { proof, args, extraArgs };
}

// src/sherpa.js
var import_axios = __toESM(require("axios"));

// src/constants.js
init_cjs_shims();
var ethSherpaABI = [
  {
    "type": "function",
    "name": "isSpent",
    "inputs": [{ "name": "_nullifierHash", "type": "bytes32" }],
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }]
  },
  {
    "type": "function",
    "name": "isKnownRoot",
    "inputs": [{ "name": "_root", "type": "bytes32" }],
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }]
  }
];
var sherpaProxyABI = [
  {
    "type": "function",
    "name": "deposit",
    "inputs": [
      { "name": "_sherpa", "type": "address" },
      { "name": "_commitment", "type": "bytes32" },
      { "name": "_encryptedNote", "type": "bytes" }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      { "name": "_sherpa", "type": "address" },
      { "name": "_proof", "type": "bytes" },
      { "name": "_root", "type": "bytes32" },
      { "name": "_nullifierHash", "type": "bytes32" },
      { "name": "_recipient", "type": "address" },
      { "name": "_relayer", "type": "address" },
      { "name": "_fee", "type": "uint256" },
      { "name": "_refund", "type": "uint256" }
    ],
    "outputs": []
  }
];
var state = {
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
    }
  ],
  contracts: [
    {
      label: "10",
      contractAddress: "0x66F4f64f9Dce3eB1476af5E1f530228b8eD0a63f",
      contractDomain: "avax-10.sherpa.avax",
      token: "avax",
      allowance: Number.MAX_SAFE_INTEGER,
      value: 1e19,
      chainId: 43113
    },
    {
      label: "100",
      contractAddress: "0x9B247a159a0bB483098620656ADf8Bcac1365A1f",
      contractDomain: "avax-100.sherpa.avax",
      token: "avax",
      allowance: Number.MAX_SAFE_INTEGER,
      value: 1e20,
      chainId: 43113
    },
    {
      label: "500",
      contractAddress: "0x345aeAbf09Bc4Ee603af672d2De925483c35A5b0",
      contractDomain: "avax-500.sherpa.avax",
      token: "avax",
      allowance: Number.MAX_SAFE_INTEGER,
      value: 5e20,
      chainId: 43113
    },
    {
      label: "10",
      contractAddress: "0xe1376DeF383D1656f5a40B6ba31F8C035BFc26Aa",
      contractDomain: "avax-10.sherpa.avax",
      token: "avax",
      allowance: Number.MAX_SAFE_INTEGER,
      value: 1e19,
      chainId: 43114
    },
    {
      label: "100",
      contractAddress: "0x7CE57f6a5a135eb1a8e9640Af1eff9665ade00D9",
      contractDomain: "avax-100.sherpa.avax",
      token: "avax",
      allowance: Number.MAX_SAFE_INTEGER,
      value: 1e20,
      chainId: 43114
    },
    {
      label: "500",
      contractAddress: "0x6ceB170e3ec0fAfaE3Be5A02FEFb81F524FE85C5",
      contractDomain: "avax-500.sherpa.avax",
      token: "avax",
      allowance: Number.MAX_SAFE_INTEGER,
      value: 5e20,
      chainId: 43114
    },
    {
      label: "100",
      contractAddress: "0xBA00d4B0A8E9A63c3c5788908c8a93A242d26e51",
      contractDomain: "tsd-100.sherpa.avax",
      token: "tsd",
      allowance: null,
      value: 1e20,
      chainId: 43113
    },
    {
      label: "1000",
      contractAddress: "0x4F3c2d6B74b387936b25916b81348881F09c8bdf",
      contractDomain: "tsd-1000.sherpa.avax",
      token: "tsd",
      allowance: null,
      value: 1e21,
      chainId: 43113
    },
    {
      label: "10000",
      contractAddress: "0x7409642215b43F7DDAb528004D9ae9A414190A45",
      contractDomain: "tsd-10000.sherpa.avax",
      token: "tsd",
      allowance: null,
      value: 1e22,
      chainId: 43113
    },
    {
      label: "100",
      contractAddress: "0x0B50666bA2fE78c025ccEB014F9622eB769bee94",
      contractDomain: "tsd-100.sherpa.avax",
      token: "tsd",
      allowance: null,
      value: 1e20,
      chainId: 43114
    },
    {
      label: "1000",
      contractAddress: "0xeeE270f3F38D135Ea9Bda18fDDC205a253D02c50",
      contractDomain: "tsd-1000.sherpa.avax",
      token: "tsd",
      allowance: null,
      value: 1e21,
      chainId: 43114
    },
    {
      label: "10000",
      contractAddress: "0x762cbdC98e64F3ABf2741AfB3781e5cBDA4DD783",
      contractDomain: "tsd-10000.sherpa.avax",
      token: "tsd",
      allowance: null,
      value: 1e22,
      chainId: 43114
    },
    {
      label: "25",
      contractAddress: "0xbc3c7BD7328c35b2fFaD20F5899ef2581D2d2ec4",
      contractDomain: "elk-25.sherpa.avax",
      token: "elk",
      allowance: null,
      value: 25e18,
      chainId: 43114
    },
    {
      label: "250",
      contractAddress: "0x56Ac03CE9a3BEb17FD84ECef6d4D8de4070e601D",
      contractDomain: "elk-250.sherpa.avax",
      token: "elk",
      allowance: null,
      value: 25e19,
      chainId: 43114
    },
    {
      label: "500",
      contractAddress: "0x238F453A08C7A136603D40E092F150D5B35e62E2",
      contractDomain: "elk-500.sherpa.avax",
      token: "elk",
      allowance: null,
      value: 5e20,
      chainId: 43114
    }
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
  sherpaProxyContract: {
    fuji: "0xC0EB087ac8C732AC23c52A16627c4539d8966d79",
    mainnet: "0x171Fb28ebfFcb2737E530E1Fd48CB4Ef12E5031e"
  },
  relayerMode: true,
  relayersList: [
    {
      id: 1,
      url: "https://relayer.sherpa.entropygra.ph",
      name: "Sherpa Relayer",
      chainId: 43114,
      fee: 1,
      status: {}
    },
    {
      id: 2,
      url: "https://relayer-fuji.sherpa.entropygra.ph",
      name: "Sherpa Fuji Relayer",
      chainId: 43113,
      fee: 1,
      status: {}
    },
    {
      id: 3,
      url: "http://localhost:8000",
      name: "Local Test Relayer",
      chainId: 43114,
      fee: 0.1,
      status: {}
    },
    {
      id: 4,
      url: "http://localhost:8000",
      name: "Local Test Relayer",
      chainId: 43113,
      fee: 0.1,
      status: {}
    }
  ],
  selectedRelayerId: 1
};
var getters = {
  getNoteContractInfo: (parsedNote) => {
    return state.contracts.filter((contract) => {
      return contract.label == parsedNote.amount && contract.token === parsedNote.currency && contract.chainId === parsedNote.netId;
    })[0];
  },
  getSherpaProxyContract: (chainId) => {
    return chainId == 43114 ? state.sherpaProxyContract.mainnet : state.sherpaProxyContract.fuji;
  },
  getRelayersList: (chainId) => {
    return state.relayersList.filter((relayer) => relayer.chainId === chainId);
  },
  getRelayerStatus: async (relayer) => {
    return await (await fetch(`${relayer.url}/v1/status`)).json();
  }
};

// src/events.js
init_cjs_shims();
var import_web3 = __toESM(require("web3"));

// src/networkConfig.js
init_cjs_shims();
var networkConfig = {
  chainId43114: {
    currencyName: "AVAX",
    networkName: "Mainnet",
    rpcUrls: {
      Main: {
        name: "Main",
        url: "https://api.avax.network/ext/bc/C/rpc"
      }
    },
    subgraph: "https://api.thegraph.com/subgraphs/name/sherpa-cash/sherpa"
  },
  chainId43113: {
    currencyName: "AVAX",
    networkName: "Fuji",
    rpcUrls: {
      Main: {
        name: "Main",
        url: "https://api.avax-test.network/ext/bc/C/rpc"
      }
    },
    subgraph: "https://api.thegraph.com/subgraphs/name/sherpa-cash/sherpa-fuji"
  }
};
var networkConfig_default = networkConfig;

// src/events.js
var import_graphql_request = require("graphql-request");
var actions = {
  setErrorCode({ commit }, error) {
    commit("setError", error);
  },
  async getStatisticsSubgraph({ dispatch, commit, rootState }, contractAddress, chainId) {
    const events = [];
    const contract = rootState.sherpa.contracts.find((contract2) => contract2.contractAddress === contractAddress);
    const amnt = contract.label;
    const curr = contract.token.toUpperCase();
    const dep = await subgraphDepositQuery(18, 0, amnt, curr, chainId);
    console.log(dep);
    const standardDepositEvents = dep.map((e) => ({
      type: "Deposit",
      leafIndex: parseInt(e.index),
      commitment: e.commitment,
      blockTime: new Date(parseInt(e.timestamp) * 1e3).getTime(),
      txHash: e.transactionHash,
      timestamp: e.timestamp,
      dateTime: new Date(parseInt(e.timestamp) * 1e3)
    }));
    events.push(...standardDepositEvents);
    const lb = dep.length > 0 ? parseInt(dep[0].blockNumber) : 0;
    return { events, latestBlockFetched: lb, contractAddress };
  },
  async getEventsSubgraph(sherpaStats, contractAddress, chainId) {
    const events = [];
    const dep = [];
    const wit = [];
    const contract = sherpaStats.contracts.find((contract2) => contract2.contractAddress === contractAddress);
    const amnt = contract.label;
    const curr = contract.token.toUpperCase();
    let offset = 0;
    let depReturn;
    let witReturn;
    while (1) {
      depReturn = await subgraphDepositQuery(1e3, offset, amnt, curr, chainId);
      if (depReturn.length === 0) {
        break;
      }
      dep.push(...depReturn);
      offset += 1e3;
    }
    offset = 0;
    while (1) {
      witReturn = await subgraphWithdrawalQuery(1e3, offset, amnt, curr, chainId);
      if (witReturn.length === 0) {
        break;
      }
      wit.push(...witReturn);
      offset += 1e3;
    }
    const standardDepositEvents = dep.map((e) => ({
      type: "Deposit",
      leafIndex: parseInt(e.index),
      commitment: e.commitment,
      blockTime: new Date(parseInt(e.timestamp) * 1e3).getTime(),
      txHash: e.transactionHash,
      timestamp: e.timestamp,
      dateTime: new Date(parseInt(e.timestamp) * 1e3)
    }));
    const standardWithdrawalEvents = wit.map((e) => ({
      type: "Withdrawal",
      to: e.to,
      nullifierHash: e.nullifier,
      fee: parseInt(e.fee),
      blockTime: new Date(parseInt(e.timestamp) * 1e3).getTime(),
      txHash: e.transactionHash,
      timestamp: e.timestamp,
      dateTime: new Date(parseInt(e.timestamp) * 1e3)
    }));
    events.push(...standardDepositEvents);
    events.push(...standardWithdrawalEvents);
    const db = dep[0] ? parseInt(dep[0].blockNumber) : 0;
    const wb = wit[0] ? parseInt(wit[0].blockNumber) : 0;
    const lb = Math.max(db, wb);
    return { events, latestBlockFetched: lb, contractAddress };
  }
};
function sortEventsByLeafIndex(a, b) {
  return a.leafIndex < b.leafIndex ? 1 : -1;
}
async function subgraphDepositQuery(first, offset, amnt, curr, chainId) {
  const network = __spreadProps(__spreadValues({}, networkConfig_default[`chainId${chainId}`]), { id: Number(chainId) });
  const APIURL = network.subgraph;
  const depQuery = import_graphql_request.gql`
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
    `;
  const variables = {
    first,
    offset,
    curr,
    amnt
  };
  const response = await (0, import_graphql_request.request)(APIURL, depQuery, variables).catch((err) => console.log(err));
  return response.deposits;
}
async function subgraphWithdrawalQuery(first, offset, amnt, curr, chainId) {
  const network = __spreadProps(__spreadValues({}, networkConfig_default[`chainId${chainId}`]), { id: Number(chainId) });
  const APIURL = network.subgraph;
  const witQuery = import_graphql_request.gql`
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
    `;
  const variables = {
    first,
    offset,
    curr,
    amnt
  };
  const response = await (0, import_graphql_request.request)(APIURL, witQuery, variables).catch((err) => console.log(err));
  return response.withdrawals;
}

// src/sherpa.js
var SherpaSDK = class {
  constructor(chainId, web3, withdrawKeyDomain) {
    if (!chainId || !web3) {
      throw new Error("Must initialize sherpa sdk with chainId and web3");
    }
    this.chainId = chainId;
    this.web3 = web3;
    this.withdrawKeyDomain = withdrawKeyDomain || "";
  }
  async fetchCircuitAndProvingKey() {
    const circuit = await (await fetch(`${this.withdrawKeyDomain}/withdraw.json`)).json();
    const provingKey = await (await fetch(`${this.withdrawKeyDomain}/withdraw_proving_key.bin`)).arrayBuffer();
    this.circuit = circuit;
    this.provingKey = provingKey;
  }
  async fetchEvents(valueWei, selectedToken) {
    const selectedContractAddress = getters.getNoteContractInfo({
      amount: Number(valueWei),
      currency: selectedToken,
      netId: this.chainId
    }).contractAddress;
    const events = await actions.getEventsSubgraph(state, selectedContractAddress, this.chainId);
    this.events = events;
    return events;
  }
  createDeposit(amount, token) {
    const { noteString, commitment } = getNoteStringAndCommitment(token, amount, this.chainId);
    return {
      noteString,
      commitment
    };
  }
  getRelayerList() {
    return getters.getRelayersList(this.chainId);
  }
  async downloadNote(noteString, saveAs) {
    let blob = new Blob([noteString], {
      type: "text/plain;charset=utf-8"
    });
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    const [protocol, token, amount] = noteString.split("-");
    const filename = `backup-${[protocol, token, amount, timestamp].join("-")}.txt`;
    await saveAs(blob, filename);
  }
  async getCompliance(uniqueKey) {
    const { commitmentHex, nullifierHex } = parseNote(uniqueKey).deposit;
    const [_, selectedToken, valueWei] = uniqueKey.split("-");
    await this.fetchEvents(valueWei, selectedToken);
    const compliance = { deposit: null, withdrawl: null };
    const depositEvent = this.events.events.find((e) => e.commitment == commitmentHex);
    if (!depositEvent) {
      throw new Error("Could not find deposit");
    }
    const { from } = await this.web3.eth.getTransaction(depositEvent == null ? void 0 : depositEvent.txHash);
    compliance.deposit = {
      transaction: depositEvent == null ? void 0 : depositEvent.txHash,
      address: from,
      id: commitmentHex
    };
    const withdrawlEvent = this.events.events.find((e) => e.nullifierHash == nullifierHex);
    compliance.withdrawl = {
      transaction: withdrawlEvent == null ? void 0 : withdrawlEvent.txHash,
      address: withdrawlEvent == null ? void 0 : withdrawlEvent.to,
      id: nullifierHex
    };
    return compliance;
  }
  async sendDeposit(value, commitment, selectedToken, fromAddress) {
    const sherpaProxyAddress = getters.getSherpaProxyContract(this.chainId);
    if (this.chainId !== await this.web3.eth.getChainId()) {
      throw new Error("Cant make a deposit in wrong network");
    }
    const valueWei = value * 1e18;
    const selectedContractAddress = getters.getNoteContractInfo({
      amount: Number(value),
      currency: selectedToken,
      netId: this.chainId
    }).contractAddress;
    let pitContract = new this.web3.eth.Contract(sherpaProxyABI, sherpaProxyAddress);
    return await pitContract.methods.deposit(selectedContractAddress, toHex(commitment), 0).send({
      value: selectedToken === "avax" ? valueWei : 0,
      from: fromAddress,
      gas: 21e5
    });
  }
  async withdraw(withdrawNote, withdrawAddress, selfRelay, selectedRelayer) {
    var _a, _b;
    if (!this.events || !this.circuit || !this.provingKey) {
      throw new Error("Sherpa SDK not initialized with events or circuir/proving key");
    }
    if (!selfRelay && !(selectedRelayer && selectedRelayer.chainId && selectedRelayer.url)) {
      throw new Error("A relayer must be selected to use non self relay");
    }
    const parsedNote = parseNote(withdrawNote);
    const addressRegex = /^0x[a-fA-F0-9]{40}/g;
    const match = addressRegex.exec(withdrawAddress);
    if (!match) {
      throw new Error("The address has invalid format");
    }
    const contractInfo = getters.getNoteContractInfo(parsedNote);
    let sherpaProxyContractAddress = getters.getSherpaProxyContract(this.chainId);
    const pitContract = new this.web3.eth.Contract(sherpaProxyABI, sherpaProxyContractAddress);
    const sherpaContract = new this.web3.eth.Contract(ethSherpaABI, contractInfo.contractAddress);
    const depositEvents = this.events.events.filter((e) => e.type === "Deposit").sort(sortEventsByLeafIndex);
    if (!selfRelay) {
      if (parsedNote.netId !== selectedRelayer.chainId && parsedNote.netId !== "*") {
        throw new Error("This relayer is for a different network");
      }
    }
    let totalFee = 0;
    let rewardAccount = 0;
    let refundAmount = 0;
    if (!selfRelay) {
      const relayerStatus = await getters.getRelayerStatus(selectedRelayer);
      const relayerWithStatus = __spreadProps(__spreadValues({}, selectedRelayer), { status: relayerStatus });
      totalFee = BigInt(((_a = relayerWithStatus.status) == null ? void 0 : _a.tornadoServiceFee) * 1e4).mul(BigInt(contractInfo.value)).div(BigInt(1e6)).add(BigInt(225 * 35e4));
      rewardAccount = (_b = relayerWithStatus.status) == null ? void 0 : _b.rewardAccount;
      refundAmount = 0;
    }
    const { proof, args } = await generateProofSherpa(sherpaContract, parsedNote.deposit, withdrawAddress, depositEvents, this.circuit, this.provingKey, rewardAccount, totalFee, refundAmount);
    if (!selfRelay) {
      const requestBody = {
        proof,
        contract: contractInfo.contractAddress,
        args: [args[0], args[1], args[2], args[3], args[4], args[5]]
      };
      return await import_axios.default.post(selectedRelayer.url + "/v1/tornadoWithdraw", requestBody);
    } else {
      if (parsedNote.netId !== await this.web3.eth.getChainId()) {
        throw new Error("Your wallet is not configured to the correct network.");
      }
      return await pitContract.methods.withdraw(contractInfo.contractAddress, proof, ...args).send({
        from: withdrawAddress,
        gas: 1e6
      });
    }
  }
};
module.exports = __toCommonJS(sherpa_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SherpaSDK
});
