import web3 from './web3_'
import physicalCertificateAbi from '../abi/physicalCertificate.json'

function getInstance(address) {
    const instance = new web3.eth.Contract(physicalCertificateAbi.abi,address)
    return instance
}

   


export default getInstance