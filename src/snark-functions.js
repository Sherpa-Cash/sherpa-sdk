const randomBytes = require("crypto").randomBytes;
const circomlib = require("circomlib");
const { bigInt } = require("snarkjs");
const assert = require("assert");
const buildGroth16 = require("websnark/src/groth16");
const websnarkUtils = require("websnark/src/utils");
const merkleTree = require("./lib/merkleTree");

const MERKLE_TREE_HEIGHT = 20;


const rbigint = nbytes => bigInt.leBuff2int(randomBytes(nbytes));
// Compute pedersen hash
export function pedersenHash(data) {
  console.log("pedersen data");
  return circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0];
}

/** BigNumber to hex string of specified length */
export function toHex(number, length = 32) {
  const str =
    number instanceof Buffer
      ? number.toString("hex")
      : bigInt(number).toString(16);
  return "0x" + str.padStart(length * 2, "0");
}

// const toHex = (number: any, length = 32) =>
//   '0x' + (number instanceof Buffer ? number.toString('hex') : bigInt(number).toString(16)).padStart(length * 2, '0');

export function getNoteStringAndCommitment(currency, amount, netId) {
  const nullifier = rbigint(31);
  const secret = rbigint(31);
  // get snarks note and commitment
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

export function parseNote(noteString) {
  const noteRegex = /sherpa-(?<currency>\w+)-(?<amount>[\d.]+)-(?<netId>\d+)-0x(?<note>[0-9a-fA-F]{124})/g;
  const match = noteRegex.exec(noteString);

  if (!match) {
    throw new Error("The note has invalid format"+ JSON.stringify(noteString));
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

//
export function createDeposit({ nullifier, secret }) {
  let deposit = { nullifier, secret };
  deposit.preimage = Buffer.concat([
    deposit.nullifier.leInt2Buff(31),
    deposit.secret.leInt2Buff(31)
  ]);
  deposit.commitment = pedersenHash(deposit.preimage);
  deposit.commitmentHex = toHex(deposit.commitment)
  deposit.nullifierHash = pedersenHash(deposit.nullifier.leInt2Buff(31));
  deposit.nullifierHex = toHex(deposit.nullifierHash)
  return deposit;
}

export async function generateMerkleProofSherpa(events, deposit, contract) {
  // Get all deposit events from smart contract and assemble merkle tree from them

  const leaves = events.map(e => e.commitment);

  const tree = new merkleTree(MERKLE_TREE_HEIGHT, leaves.reverse());

  const depositEvent = events.find(
    e => e.commitment === toHex(deposit.commitment)
  );

  const leafIndex = depositEvent ? depositEvent.leafIndex : -1;

  // // Validate that our data is correct
  const isValidRoot = await contract.methods
    .isKnownRoot(toHex(await tree.root()))
    .call();

  console.log("isValidRoot", isValidRoot);
  const isSpent = await contract.methods
    .isSpent(toHex(deposit.nullifierHash))
    .call();
  assert(isValidRoot === true, "Merkle tree is corrupted");
  assert(isSpent === false, "The note is already spent");
  assert(leafIndex >= 0, "The deposit is not found in the tree");

  // Compute merkle proof of our commitment
  return tree.path(leafIndex);
}
export async function generateProofSherpa(contract, deposit, recipient, events, circuit, provingKey, relayer = 0, fee = 0, refund = 0) {
  // Compute Merkle proof of commitment
  const {root, path_elements, path_index} = await generateMerkleProofSherpa(events, deposit, contract)
  const input = {
    // Public snark inputs
    root: root,
    nullifierHash: deposit.nullifierHash,
    recipient: bigInt(recipient),
    relayer: bigInt(relayer),
    fee: bigInt(fee),
    refund: bigInt(refund),

    // Private snark inputs
    nullifier: deposit.nullifier,
    secret: deposit.secret,
    pathElements: path_elements,
    pathIndices: path_index,
  }
  const groth16 = await buildGroth16();

  console.log('Generating SNARK proof')
  console.time('Proof time')
  const proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, provingKey)
  const {proof} = websnarkUtils.toSolidityInput(proofData)
  console.timeEnd('Proof time')

  const args = [
    toHex(input.root),
    toHex(input.nullifierHash),
    toHex(input.recipient, 20),
    toHex(input.relayer, 20),
    toHex(input.fee),
    toHex(input.refund)
  ]
  const extraArgs = [deposit.nullifier, deposit.secret, path_elements, path_index]
  return { proof, args, extraArgs }
}
