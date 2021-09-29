import React, { useEffect, useState, createRef, useRef } from "react";
import Base from "./Base";
import { useParams } from 'react-router-dom'
import OnescanVerify from '../script/OnescanVerify'
import MetaMaskOnboarding from '@metamask/onboarding';
import '../css/CreateContract.css'
import getInstance from '../script/PhysicalCertificate'
import web3 from "../script/web3_";
import { create } from 'ipfs-http-client'
import QRCode from 'qrcode'
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const ipfsClient = create('https://ipfs.infura.io:5001/api/v0')
const ipfsBaseURL = 'https://ipfs.infura.io/ipfs/'


function CreateContract() {
    let { index } = useParams()
    const [contractStatus, setContractStatus] = useState(false);
    const [accounts, setAccounts] = useState('')
    const [certificateType, setCertificateType] = useState('Physical');
    const [loading, setLoading] = useState(true)
    const [contractName, setContractName] = useState('')
    const [contractList, setContractList] = useState([])
    const [selectedContract, setSelectedContract] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [uniqID, setUniqID] = useState('')
    const [uniqPassword, setUniqPassword] = useState('')
    const [pin, setPin] = useState('')
    const uploadCertificate = createRef();
    const [formVisibility, setFormVisibility] = useState(true)
    const [pdfData, setPdfData] = useState(null)
    const [companyName, setCompanyName] = useState('');
    const [companyCIN, setCompanyCIN] = useState('');
    const [companyPAN, setCompanyPAN] = useState('');
    const [fee, setFee] = useState(0.02)
    const [fileName, setFileName] = useState('');
    const [uploadStatus, setUploadStatus] = useState(true)
    const [errorMessage,setErrorMessage] = useState('')




    useEffect(async () => {
        function handleNewAccounts(newAccounts) {
            setAccounts(newAccounts);
        }
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            await window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then(handleNewAccounts);
            await window.ethereum.on('accountsChanged', handleNewAccounts);
            return async () => {
                await window.ethereum.off('accountsChanged', handleNewAccounts);
            };
        }

    }, []);


    useEffect(() => {

        async function getOwnerContractStatus() {
            // console.log(accounts[0])
            const result = await OnescanVerify.methods.getOwnerContract(accounts[0]).call()
            if (result.length > 0) {
                setContractStatus(true)
                result.forEach(i => {
                    setContractList(prevstate => [
                        ...prevstate,
                        {
                            contractName: i.contractName,
                            contractType: i.contractType,
                            contractaddress: i.contractaddress,
                            requestIndex: i.requestIndex
                        }
                    ])
                })

            }

        }
        if (accounts.length > 0) {
            getOwnerContractStatus()
        }

    }, [accounts])

    useEffect(() => {
        // console.log(contractList)
    }, [contractList])

    function Options(props) {
        return (
            <option value={props.value}>{props.name}</option>
        )
    }

    function SelectOption() {
        return (contractList.map((i, index) => {
            return (
                <Options
                    key={index}
                    value={i.contractaddress}
                    name={i.contractName + '-' + i.contractaddress}
                />
            )
        }))

    }

    const selectionOnChange = async (event) => {
        event.preventDefault()
        setSelectedContract(event.target.value)
        if (event.target.value !== "Select Contract") {
            const address = event.target.value
            const instance = getInstance(address)
            setFormVisibility(false)
            // console.log(await instance.methods.getSecretPin().call())
        } else {
            setFormVisibility(true)
        }

    }

    const onSubmit = async (event) => {
        setErrorMessage('')
        event.preventDefault()
        setLoading(false)
        try {
            const result = await OnescanVerify.methods.createNewContract(index, certificateType, contractName).send({
                from: accounts[0]
            })
            // console.log(result)

        } catch (err) {
            // console.log(err)
            setErrorMessage(err.message)
        }
        setLoading(true)
        window.location.reload()
    }

    useEffect(() => {
        if (accounts.length > 0) {
            getCompanyData()
        }

    }, [accounts])

    async function getCompanyData() {
        setErrorMessage('')
        try {
            var issuerRequestArray = []
            const issuerRequestCount = await OnescanVerify.methods.issuerRequestCount().call()
            for (var i = 0; i < issuerRequestCount; i++) {
                const issuerRequestResult = await OnescanVerify.methods.issuerRequest(i).call()
                const obj = {
                    issuerArray: issuerRequestResult,
                    index: i
                }
                issuerRequestArray.push(obj)
            }
            const selectedData = issuerRequestArray.filter(i => {
                return i['issuerArray'].issuerAddress.toLowerCase() === accounts[0]
            })
            if (selectedData.length > 0) {
                fetch(ipfsBaseURL + selectedData[0]['issuerArray'].issuerCID).then(response => response.json()).then(metadata => {
                    setCompanyName(metadata["Company Name"])
                    setCompanyCIN(metadata["Company CIN"])
                    setCompanyPAN(metadata["Company PAN"])

                })
            } else {
                setCompanyName('')
                setCompanyCIN('')
                setCompanyPAN('')
            }


        } catch (err) {
            // console.log(err)
            setErrorMessage(err.message)
        }
    }


    const onClickUpload = (event) => {
        event.preventDefault()
        const reader = new FileReader()
        setFileName(uploadCertificate.current.files[0].name)
        reader.readAsDataURL(uploadCertificate.current.files[0])
        reader.addEventListener('load', () => {
            setPdfData(reader.result)
            var pdfBuffer = Buffer(reader.result.split(',')[1], "base64")
            // console.log(pdfBuffer)
        })
        setUploadStatus(false)
    }
    const createSecretPass = () => {
        const first4Letter = firstName.toUpperCase().substring(0, 4)
        const last4Digit = uniqID.substring((uniqID.length) - 4, uniqID.length)
        const password = first4Letter + last4Digit
        setUniqPassword(web3.utils.sha3(password))
        // console.log(password)
        // console.log(web3.utils.sha3(password))
        return web3.utils.sha3(password)
    }

    const createSecrectPin = async (randomNum) => {
        // const instance = getInstance(selectedContract)
        // let randomNum = await instance.methods.getSecretPin().call()
        // console.log(randomNum)
        randomNum = (randomNum).toString()
        if (randomNum.length === 1) {
            randomNum = '000' + randomNum
        } else if (randomNum.length === 2) {
            randomNum = '00' + randomNum
        } else if (randomNum.length === 3) {
            randomNum = '0' + randomNum
        }
        // console.log('random', randomNum)
        setPin(randomNum)
        return randomNum
    }

    const uploadDataToIPFS = async () => {
        setErrorMessage('')
        const certificateDetails = {
            'FirstName': firstName,
            'LastName': lastName,
            'EnrolmentId': uniqID,
            'CompanyName': companyName,
            'CompanyCIN': companyCIN,
            'CompanyPAN': companyPAN
        }
        try {
            const metaData = await ipfsClient.add(JSON.stringify(certificateDetails))
            // console.log(metaData.path)
            return (metaData.path)
        } catch (err) {
            // console.log(err)
            setErrorMessage(err.message)
            return ('')
        }
    }

    const onSubmitGenerate = async (event) => {
        setErrorMessage('')
        event.preventDefault()
        setLoading(false)
        const secretPasswordHash = createSecretPass()
        const instance = getInstance(selectedContract)
        const randNum = await createSecrectPin(Math.floor((Math.random() * 10000) + 1))
        const secretPinHash = web3.utils.sha3(randNum.toString())
        const metaDataCID = await uploadDataToIPFS()
        const tokenURI = ipfsBaseURL + metaDataCID
        const feeWei = web3.utils.toWei(fee.toString(), 'ether')
        // console.log(feeWei)
        try {
            const tokenID = await instance.methods.mint(secretPasswordHash, secretPinHash, tokenURI).send({
                value: feeWei,
                from: accounts[0]
            })
            
            const Id =tokenID.events.Transfer.returnValues.tokenId
            const hostName = window.location.host
            const claimURL = 'https://' + hostName + '/claim/' + selectedContract + '/' + Id
            // console.log(claimURL)
            QRCode.toDataURL(claimURL).then(async (data) => {
                const imageBuff = Buffer(data.split(',')[1], "base64")
                const pdfDoc = await PDFDocument.load(pdfData);
                const jpgImage = await pdfDoc.embedPng(imageBuff);
                const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
                const jpgDims = jpgImage.scale(0.60)
                const pages = pdfDoc.getPages();
                const firstPage = pages[0];

                // Get the width and height of the first page
                const { width, height } = firstPage.getSize();
                // console.log('width', width)
                // console.log('height', height)
                firstPage.drawImage(
                    jpgImage, {
                    x: 400,
                    y: 510,
                    width: jpgDims.width,
                    height: jpgDims.height,
                })
                firstPage.drawText('  PIN-' + randNum, {
                    x: 420,
                    y: 506,
                    size: 12,
                    font: helveticaFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(0),
                })
                const pdfBytes = await pdfDoc.save();
                var bytes = new Uint8Array(pdfBytes);
                var blob = new Blob([bytes], { type: "application/pdf" });
                const docUrl = URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = docUrl;
                a.download = fileName;
                a.click();

            })
            setUploadStatus(true)

        } catch (err) {
            // console.log(err)
            setErrorMessage(err.message)
        }



        setLoading(true)
        

    }

    return (
        <Base>
            <div className="CreateContractContainer">
                <h3 className="card-title m-2 text-center">Certificate Generator Portal</h3>
                <div className="container card shadow">
                    <div className="accordion accordion-flush mt-2" id="issuerFlush">
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="register-heading">
                                <button className={`accordion-button ${!contractStatus ? '' : 'collapsed'} fw-bold`} type="button" data-bs-toggle="collapse" data-bs-target="#register-collapse" aria-expanded={!{ contractStatus }} aria-controls="register-collapse">
                                    Create Certificate Contract
                                </button>
                            </h2>
                            <div id="register-collapse" className={`accordion-collapse ${!contractStatus ? 'show' : 'collapse'}`} aria-labelledby="register-heading" data-bs-parent="#issuerFlush">
                                <div className="accordion-body">
                                    <p>Fill the below form and create new certificate contract(Basically NFT Contract).
                                    </p>
                                    <form className="m-2" style={{ height: '100%' }} onSubmit={onSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="issuerAddress" className="form-label">Issuer Address</label>
                                            <span id="issuerAddress" aria-describedby="issuerAddressHelp" type='text'
                                                className="form-control" style={{ background: "#e9ecef" }}
                                            >{accounts[0]} </span>
                                            <div id="issuerAddressHelp" className="form-text">e.g."Certificate Issuer address."</div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="requestIndexInput" className="form-label">Request Index</label>
                                            <span id="requestIndexInput" aria-describedby="requestIndexInputHelp" type='text'
                                                className="form-control" style={{ background: "#e9ecef" }}

                                            >{index}</span>
                                            <div id="requestIndexInputHelp" className="form-text">e.g."Issuer's request index. "</div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="NameInput" className="form-label">Contract Name</label>
                                            <input id="NameInput" aria-describedby="NameInputHelp" type='text'
                                                className="form-control"
                                                value={contractName}
                                                onChange={(event) => setContractName(event.target.value)}
                                                required

                                            />
                                            <div id="NameInputHelp" className="form-text">"Enter your contract name" e.g Diploma or Degree Certificate</div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="certificateType" className="form-label">Certificate Type</label>
                                            <select id="certificateType" className="form-select" aria-describedby="certificateTypeHelp"
                                                value={certificateType}
                                                onChange={(event) => setCertificateType(event.target.value)}>
                                                <option value="Physical">Physical</option>
                                                {/* <option value="Digital">Digital</option> */}
                                            </select>
                                            <div id="certificateTypeHelp" className="form-text">e.g."Which type of certificate you want to generate.e.g Physical or Digital"</div>
                                        </div>
                                        <span className="text-danger" hidden={!errorMessage}>{errorMessage}</span>
                                        <div className="mb-3 d-flex" style={{ alignItems: 'center' }}>
                                            <button type="submit" className="btn btn-dark form-control" disabled={(!loading)}>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" hidden={loading}></span>
                                                Create Contract</button>
                                        </div>
                                        <div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="create-heading">
                                <button className={`accordion-button ${contractStatus ? '' : 'collapsed'} fw-bold`} type="button" data-bs-toggle="collapse" data-bs-target="#create-collapse" aria-expanded={{ contractStatus }} aria-controls="create-collapse">
                                    Generate New Certificate
                                </button>
                            </h2>
                            <div id="create-collapse" className={`accordion-collapse ${contractStatus ? 'show' : 'collapse'}`} aria-labelledby="create-heading" data-bs-parent="#issuerFlush">
                                <div className="accordion-body">
                                    <div className="row mb-3">
                                        <div className="col-lg-4 mt-2">
                                            <label htmlFor="certificateType" className="form-label ">Select Certificate Contract</label>
                                        </div>

                                        <div className="col-auto mt-2">
                                            <select className="form-select"
                                                value={selectedContract}
                                                onChange={selectionOnChange}>
                                                <option value="Select Contract"> Select Contract </option>
                                                <SelectOption />
                                            </select>
                                        </div>
                                    </div>
                                    <hr className="bg-danger border-2 border-top border-danger mb-3"></hr>
                                    <form className="m-2" style={{ height: '100%' }} onSubmit={onSubmitGenerate} hidden={formVisibility}>
                                        <div className="row mb-3">
                                            <label htmlFor="firstname" className="form-label col-lg-4">First Name</label>
                                            <div className="col-lg-6">
                                                <input id="firstname" aria-describedby="firstnameHelp" type='text'
                                                    className="form-control"
                                                    value={firstName}
                                                    onChange={(event) => setFirstName(event.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="lastname" className="form-label col-lg-4">Last Name</label>
                                            <div className="col-lg-6">
                                                <input id="lastname" aria-describedby="lastnameHelp" type='text'
                                                    className="form-control"
                                                    value={lastName}
                                                    onChange={(event) => setLastName(event.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="enrolmentID" className="form-label col-lg-4">Registration/EnrolmentId</label>
                                            <div className="col-lg-6">
                                                <input id="enrolmentID" aria-describedby="enrolmentIDHelp" type='text'
                                                    className="form-control"
                                                    value={uniqID}
                                                    onChange={(event) => setUniqID(event.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {/* <div className="row mb-3">
                                        <label htmlFor="uniqPass" className="form-label col-lg-4">Password</label>
                                        <div className="col-lg-6">
                                            <input id="uniqPass" aria-describedby="uniqPassHelp" type='text'
                                                className="form-control"
                                                value={uniqPassword}
                                                onChange={(event) => setUniqPassword(event.target.value)}
                                                required
                                            />
                                            <div id="uniqPassHelp" className="form-text">First Name 4 letter & Enrolment Id last 4 digit e.g."FIRS4526"</div>
                                        </div>
                                    </div> */}
                                        <div className="row mb-3">
                                            <label htmlFor="mintPrice" className="form-label col-lg-4">Minting Fee</label>
                                            <div className="col-lg-6">
                                                <input id="mintPrice" aria-describedby="mintPriceHelp" type='text' readOnly
                                                    className="form-control"
                                                    value={fee}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="fileInput" className="form-label col-lg-4">Upload Certificate</label>
                                            <div className="col-lg-6">
                                                <input type="file" className="form-control" ref={uploadCertificate}
                                                    required
                                                />
                                            </div>

                                            <div className="col-lg-2">
                                                <button className="btn btn-dark form-control" onClick={onClickUpload}>
                                                    Upload
                                                </button>
                                            </div>
                                        </div>
                                        <span className="text-danger" hidden={!errorMessage}>{errorMessage}</span>
                                        <div className="mb-3" >
                                            <button type="submit" className="btn btn-dark form-control" disabled={(!loading) || uploadStatus}>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" hidden={loading}></span>
                                                Generate Certificate</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container card shadow" hidden={!contractStatus}>
                </div>
            </div>
        </Base>
    )
}

export default CreateContract