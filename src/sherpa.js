import {
  toHex,
  getNoteStringAndCommitment,
  parseNote,
  generateProofSherpa
} from "./snark-functions";
import networkConfig from "./networkConfig";
import {state, getters, sherpaProxyABI, ethSherpaABI} from "./constants"

export class SherpaSDK {
  constructor(chainId, web3) {
    this.chainId = chainId;
    this.web3 = web3
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
  async downloadNote(noteString, saveAs){
    let blob = new Blob(noteString, {
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
  async sendDeposit(valueWei, commitment, selectedToken, fromAddress) {
    const sherpaProxyAddress = getters.getSherpaProxyContract(state)(this.netId)//todo remove currying
    const selectedContractAddress = getters.getNoteContractInfo(state)({
      amount:valueWei,
      currency:selectedToken,
      netId:this.chainId
    }).contractAddress
    let pitContract = new this.web3.eth.Contract(
      sherpaProxyABI,
      sherpaProxyAddress
    );
    await pitContract.methods.deposit(
      selectedContractAddress,
      toHex(commitment),
      0)
      .send({
        value: selectedToken === "avax" ? valueWei : 0,
        from: fromAddress,
        gas: 2100000
      });
  }
  //todo add builder to get events and circuit/proving key
  async withdraw(withdrawNote, withdrawAddress, relayerMode, events, circuit, provingKey) {
    // let web3;
    const parsedNote = parseNote(withdrawNote);
    const addressRegex = /^0x[a-fA-F0-9]{40}/g
    const match = addressRegex.exec(withdrawAddress)

    if (!match) {
      throw new Error("The address has invalid format")
    }

    if(relayerMode) {
      const id = this.chainId;
      const network = { ...networkConfig[`chainId${id}`], id: Number(id) };
      // web3 = new Web3(network.rpcUrls.Figment.url);//todo Figment? - maybe move this logic to calling function?
    } else {
      // web3 = this.$manager.web3;
      // assert(parsedNote.netId === await web3.eth.getChainId(), "Your wallet is not configured to the correct network.")//todo redo
    }
    // console.log("parsedNote", parsedNote);
    // console.log("hex commitment", toHex(parsedNote.deposit.commitment));
    const contractInfo = getters.getNoteContractInfo(state)(parsedNote);//todo remove currying
    let sherpaProxyContractAddress = getters.getSherpaProxyContract(state);
    const pitContract = new this.web3.eth.Contract(
      sherpaProxyABI,
      sherpaProxyContractAddress
    );

    const sherpaContract = new this.web3.eth.Contract(
      ethSherpaABI,
      contractInfo.contractAddress
    );

    const relayer = getters.getSelectedRelayer(state);
    const relayerFee = BigInt(0)//todo BigInt(relayer.status.tornadoServiceFee*10000).mul(BigInt(contractInfo.value)).div(BigInt(1000000))
    const gas = BigInt(225*350000)
    let totalFee = relayerFee.add(gas)
    let rewardAccount = relayer.status.rewardAccount//todo currently undefined - but we are not using a relayer for now
    let refundAmount = 0 //parsedNote.amount * (10**18)
    if(relayerMode){
      totalFee = 0
      rewardAccount = 0
      refundAmount = 0
    }
    // assert(parsedNote.netId === relayer.chainId || parsedNote.netId === '*', 'This relayer is for a different network')
    const { proof, args } = await generateProofSherpa(sherpaContract, parsedNote.deposit, withdrawAddress, events.depositEvents, circuit, provingKey, rewardAccount, totalFee, refundAmount)
    const requestBody = {
      proof: proof,
      contract: contractInfo.contractAddress,
      args: [args[0], args[1], args[2], args[3], args[4], args[5]]
    }

    if(!relayerMode){
      await pitContract.methods.withdraw(contractInfo.contractAddress, proof, ...args).send({
        from: withdrawAddress,
        gas: 1000000
      });
    }


    if(relayerMode){
      const response = await this.$axios.$post(
        relayer.url +'/v1/tornadoWithdraw', requestBody
      );
    }
  }


}



