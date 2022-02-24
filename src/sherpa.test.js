import { SherpaSDK } from './sherpa'
import Web3 from "web3"
require('dotenv').config()
jest.setTimeout(60000)
import 'isomorphic-fetch';
import {getters, state} from "./constants";
//inject fetch globally

/** trade config **/
const netId = 43113
const amount = 10
const currency = "avax"

/** test helpers **/
const testPrivKey = String(process.env.TEST_PRIVATE_KEY)
const providerUrl = String(process.env.PROVIDER_URL)
const etherToWei = (x)=>x*1e18

/** web3 **/
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl))
const fromAddress = web3.eth.accounts.privateKeyToAccount(testPrivKey).address
console.log("from address is",fromAddress)
web3.eth.accounts.wallet.add(testPrivKey)

describe("sherpa", () => {
  describe("deposit",()=>{
    it("should return notestring and commitment", async () => {
      const sherpaSDK = new SherpaSDK(netId, web3)
      const deposit = sherpaSDK.createDeposit(amount,currency)
      const notePieces = deposit.noteString.split("-")
      expect(notePieces[0]).toEqual("sherpa")
      expect(notePieces[1]).toEqual(currency)
      expect(notePieces[2]).toEqual("10")
      expect(notePieces[3]).toEqual("43113")
      expect(notePieces[4].length).toEqual(126)
      expect(deposit.commitment.length).toEqual(66)
      console.log(deposit)
    });
    it("create and download",()=>{
      jest.spyOn(global, "Blob").mockImplementationOnce(() => ({ type: "text/plain;charset=utf-8" }));
      const sherpaSDK = new SherpaSDK(netId, web3)
      const deposit = sherpaSDK.createDeposit(amount,"avax")
      const mockSaveAs = jest.fn()
      sherpaSDK.downloadNote(deposit.noteString, mockSaveAs)
      const [ blob, filename ] = mockSaveAs.mock.calls[0]
      expect(filename.startsWith("backup-sherpa-avax-10-")).toBeTruthy()
    })
    it("should create, download and send",async ()=>{
      jest.spyOn(global, "Blob").mockImplementationOnce(() => ({ type: "text/plain;charset=utf-8" }));
      const sherpaSDK = new SherpaSDK(netId, web3)
      const deposit = sherpaSDK.createDeposit(etherToWei(amount),currency)//create the unique key that will be used to withdraw
      console.log("deposit is",deposit)
      await sherpaSDK.downloadNote(deposit.noteString, jest.fn())//ensure the user has downloaded the unique key to a safe spot
      await sherpaSDK.sendDeposit(etherToWei(amount), deposit.commitment,currency,fromAddress)//send funds to the smart contract
    })
  })
  describe("compliance",()=>{
    it("should withdraw funds",async ()=>{
      /**User supplied info **/
      const uniqueKey = "sherpa-avax-10000000000000000000-43113-0x7bc53b7269c2efd58dc31dc38f4384300f6caba638345f014064ea37cce4c197482fcd323f68143ea19128c3076e4b1222f36fb295483d28fa4aaa195f95"
      /** Initialize SDK **/
      const sherpaSDK = new SherpaSDK(netId, web3)
      const compliance = await sherpaSDK.getCompliance(uniqueKey)
      expect(compliance.deposit.transaction).toBeTruthy()
      expect(compliance.deposit.address).toBeTruthy()
      expect(compliance.deposit.id).toBeTruthy()
      expect(compliance.withdrawl.transaction).toBeTruthy()
      expect(compliance.withdrawl.address).toBeTruthy()
      expect(compliance.withdrawl.id).toBeTruthy()
    })
  })

  describe("withdraw",()=>{
    it("should withdraw funds",async ()=>{

      /**User supplied info **/
      const uniqueKey = "sherpa-avax-10000000000000000000-43113-0x7bc53b7269c2efd58dc31dc38f4384300f6caba638345f014064ea37cce4c197482fcd323f68143ea19128c3076e4b1222f36fb295483d28fa4aaa195f95"
      const commitment = "0x11ba1eb85ecbaf7c1c3ad7e6248bbfb7ef5cf8f68678a6d77162cb0e1080fc28"//this is encoded above
      const destinationAddress = "0x62b54b1f870484A338cF5c7b3323a546B0f6569d"
      const selfRelay = false

      /** Initialize SDK **/
      const [_, selectedToken, valueWei] = uniqueKey.split("-")
      const sherpaSDK = new SherpaSDK(netId, web3)
      await sherpaSDK.fetchCircuitAndProvingKey()//must be done but can be done eagerly
      await sherpaSDK.fetchEvents(valueWei, selectedToken)//should be done at last moment as the data will be most live that way
      await sherpaSDK.withdraw(uniqueKey, destinationAddress, selfRelay, {})//todo
    })
  })

});