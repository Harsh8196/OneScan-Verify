
const onescanverify = artifacts.require("OnescanVerify");
const physical = artifacts.require("physicalCertificate");

contract("OnescanVerify",accounts =>{
    let getPhysicaladdres
    let checkPhysicalAddress
    it('Sender is owner',()=>{
        onescanverify.deployed()
        .then(instance => instance.owner())
        .then(owner =>
            assert.equal(
                owner,
                accounts[0],
                'Sender is not Owner.'
            ))
    })
    it('PhysicalCertificate is deployed or not',()=>{
        onescanverify.deployed()
        .then(instance => {
            instance.applyForRequest('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR','Physical') 
            return instance
        })
        .then(instance => {
            instance.approveRequest(0)
            return instance
        })
        .then(instance => {
            instance.createNewContract(0)
            return instance
        })
        .then(instance => {
            const value = instance.getOwnerContract(accounts[0])
            console.log(value[0])
            getPhysicaladdres = value[0]
        }).then(()=>{
            physical.at(getPhysicaladdres.address)
            .then(instance=>{
                checkPhysicalAddress = instance.address
                assert.equal(checkPhysicalAddress,getPhysicaladdres,'Physical address not match')
            })
        })
        
    })
})