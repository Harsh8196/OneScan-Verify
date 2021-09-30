import web3 from './web3_'
import onescanVerifyAbi from '../abi/OnescanVerify.json'


// const instance = new web3.eth.Contract(onescanVerifyAbi.abi,'0xb2909399F8e04a3f925457dB0456C6ADf5Ba8E10')
// let contractFile = JSON.parse(onescanVerifyAbi)

const instance = new web3.eth.Contract(onescanVerifyAbi.abi,'0x505C06418fF49d6bED636e67a83A9E107ffBcb33')  
// console.log(instance)

export default instance

