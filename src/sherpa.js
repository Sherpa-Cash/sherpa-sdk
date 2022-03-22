import {
  toHex,
  getNoteStringAndCommitment,
  parseNote,
  generateProofSherpa
} from "./snark-functions";
import axios from "axios"
import {state, getters, sherpaProxyABI, ethSherpaABI} from "./constants"
import {actions, sortEventsByLeafIndex} from "./events";



export class SherpaSDK {
  constructor(chainId, web3, withdrawKeyDomain) {
    if (!chainId || !web3){
      throw new Error("Must initialize sherpa sdk with chainId and web3")
    }
    this.chainId = chainId;
    this.web3 = web3
    this.withdrawKeyDomain = withdrawKeyDomain || ""
  }

  async fetchCircuitAndProvingKey(){
    const circuit = await (await fetch(`${this.withdrawKeyDomain}/withdraw.json`)).json()
    const provingKey = await (await fetch(`${this.withdrawKeyDomain}/withdraw_proving_key.bin`)).arrayBuffer()
    this.circuit=circuit
    this.provingKey=provingKey
  }

  async fetchEvents(valueWei, selectedToken){
    const selectedContractAddress = getters.getNoteContractInfo({
      amount:Number(valueWei),
      currency:selectedToken,
      netId:this.chainId
    }).contractAddress
    const events = await actions.getEventsSubgraph(state, selectedContractAddress, this.chainId)
    this.events=events
    return events
  }

  createDeposit(amount, token) {
    const { noteString, commitment } = getNoteStringAndCommitment(
      token,
      amount,
      this.chainId
    );
    return {
      noteString,
      commitment
    }
  }
  getRelayerList(){
    return getters.getRelayersList(this.chainId)
  }
  async downloadNote(noteString, saveAs){
    let blob = new Blob([noteString], {
      type: "text/plain;charset=utf-8"
    });
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    const [ protocol, token, amount ] = noteString.split("-")
    const filename = `backup-${[protocol, token, amount,timestamp].join("-")}.txt`

    await saveAs(
      blob,
      filename
    );
  }

  async getCompliance(uniqueKey){
    const {/**nullifierHash,**/ commitmentHex, nullifierHex} = parseNote(uniqueKey).deposit;
    const [_, selectedToken, valueWei] = uniqueKey.split("-")
    await this.fetchEvents(valueWei, selectedToken)
    const compliance = {deposit:null, withdrawl:null}
    const depositEvent = this.events.events.find(e=>e.commitment == commitmentHex)
    if (!depositEvent){
      throw new Error("Could not find deposit")
    }
    const {from} = await this.web3.eth.getTransaction(depositEvent?.txHash)
    compliance.deposit = {
      transaction:depositEvent?.txHash,
      address:from,
      id:commitmentHex
    }
    const withdrawlEvent = this.events.events.find(e=>e.nullifierHash == nullifierHex)
    compliance.withdrawl = {
      transaction:withdrawlEvent?.txHash,
      address:withdrawlEvent?.to,
      id:nullifierHex
    }
    return compliance
  }

  async sendDeposit(value, commitment, selectedToken, fromAddress) {
    const sherpaProxyAddress = getters.getSherpaProxyContract(this.chainId)
    if (this.chainId !== (await this.web3.eth.getChainId())) {
      throw new Error("Cant make a deposit in wrong network");
    }
    const selectedContractAddress = getters.getNoteContractInfo({
      amount:Number(value * 1e18),
      currency:selectedToken,
      netId:this.chainId
    }).contractAddress
    let pitContract = new this.web3.eth.Contract(
      sherpaProxyABI,
      sherpaProxyAddress
    );
    return await pitContract.methods.deposit(
      selectedContractAddress,
      toHex(commitment),
      0)
      .send({
        value: selectedToken === "avax" ? value : 0,
        from: fromAddress,
        gas: 2100000
      });
  }
  async withdraw(withdrawNote, withdrawAddress, selfRelay, selectedRelayer) {
    /** sanity checks **/
    if (!this.events || ! this.circuit || !this.provingKey){
      throw new Error("Sherpa SDK not initialized with events or circuir/proving key")
    }
    if (!selfRelay && !(selectedRelayer && selectedRelayer.chainId && selectedRelayer.url)){
      throw new Error("A relayer must be selected to use non self relay")
    }

    const parsedNote = parseNote(withdrawNote);
    const addressRegex = /^0x[a-fA-F0-9]{40}/g
    const match = addressRegex.exec(withdrawAddress)

    if (!match) {
      throw new Error("The address has invalid format")
    }
    /** setup **/
    const contractInfo = getters.getNoteContractInfo(parsedNote);
    let sherpaProxyContractAddress = getters.getSherpaProxyContract(this.chainId);
    const pitContract = new this.web3.eth.Contract(
      sherpaProxyABI,
      sherpaProxyContractAddress
    );

    const sherpaContract = new this.web3.eth.Contract(
      ethSherpaABI,
      contractInfo.contractAddress
    );
    const depositEvents = this.events.events.filter(e => e.type === 'Deposit').sort(sortEventsByLeafIndex);

    /** more sanity checks **/
    if (!selfRelay) {
      if (
        parsedNote.netId !== selectedRelayer.chainId &&
        parsedNote.netId !== "*"
      ) {
        throw new Error("This relayer is for a different network");
      }
    }
    /** Calculate relayer info **/
    let totalFee = 0
    let rewardAccount = 0
    let refundAmount = 0

    if(!selfRelay){
      const relayerStatus = await getters.getRelayerStatus(selectedRelayer)
      const relayerWithStatus = {...selectedRelayer, status:relayerStatus}
      totalFee = BigInt(relayerWithStatus.status?.tornadoServiceFee*10000).mul(BigInt(contractInfo.value)).div(BigInt(1000000)).add(BigInt(225*350000))
      rewardAccount = relayerWithStatus.status?.rewardAccount
      refundAmount = 0 //parsedNote.amount * (10**18)
    }

    /** calculate proof **/
    const { proof, args } = await generateProofSherpa(sherpaContract, parsedNote.deposit, withdrawAddress, depositEvents, this.circuit, this.provingKey, rewardAccount, totalFee, refundAmount)

    /** execute **/
    if(!selfRelay) {
      //can replace web3 with a non wallet web3 here
      const requestBody = {
        proof: proof,
        contract: contractInfo.contractAddress,
        args: [args[0], args[1], args[2], args[3], args[4], args[5]]
      }
      return await axios.post(
      selectedRelayer.url +'/v1/tornadoWithdraw', requestBody
      );
    } else {
      if (parsedNote.netId !== await this.web3.eth.getChainId()){
        throw new Error("Your wallet is not configured to the correct network.")
      }
      return await pitContract.methods.withdraw(contractInfo.contractAddress, proof, ...args).send({
        from: withdrawAddress,
        gas: 1000000
      });
    }
  }
}



