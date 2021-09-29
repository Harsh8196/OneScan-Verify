import React, { useState, useEffect } from 'react'
import Base from './Base'
import { useParams } from 'react-router-dom'
import '../css/Claim.css'
import getInstance from '../script/PhysicalCertificate'
import web3 from '../script/web3_'
import MetaMaskOnboarding from '@metamask/onboarding';


function Claim() {
    let { contractAddress, tokenId } = useParams()
    const [claimStatus, setClaimStatus] = useState(true)
    const [secretPassword, setSecretPasword] = useState('')
    const [secretPIN, setSecretPIN] = useState('')
    const [loading, setLoading] = useState(true)
    const [instance, setInstance] = useState(null)
    const [accounts, setAccounts] = useState('')
    const [fullName, setFullName] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [enrolmentId, setenrolmentId] = useState('')
    const [verificationStatus,setVerificationStatus] = useState(false)
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
        setInstance(getInstance(contractAddress))
    }, [])

    useEffect(() => {
        if (instance !== null) {
            getClaimStatus()
        }

    }, [instance])

    const getClaimStatus = async () => {
        setClaimStatus(await instance.methods.getClaimStatus(tokenId).call())
        // console.log()
    }

    const claimCertifcate = async (event) => {

        event.preventDefault()
        setErrorMessage('')
        setLoading(false)
        const password = web3.utils.sha3(secretPassword)
        const pin = web3.utils.sha3(secretPIN.toString())
        // console.log('password', password)
        // console.log('pin', pin)
        try {
            const result = await instance.methods.claimCertificate(tokenId, password, pin).send({
                from: accounts[0]
            })
            // console.log(result)
            window.location.reload()
        } catch (err) {
            setErrorMessage(err.message)
            // console.log(err)

        }
        setLoading(true)

    }

    const checkAuthenticity = async (event) => {
        event.preventDefault()
        setLoading(false)
        const pin = web3.utils.sha3(secretPIN)
        setErrorMessage('')
        try {
            const result = await instance.methods.checkAuthenticity(tokenId, pin).call()
            fetch(result).then(response => response.json()).then(metadata => {
                setCompanyName(metadata.CompanyName)
                setFullName(metadata.FirstName + ' ' + metadata.LastName)
                setenrolmentId(metadata.EnrolmentId)

            })
            setVerificationStatus(true)
        } catch (err) {
            setErrorMessage(err.message)
            // console.log(err.message)
            
        }
        setLoading(true)

    }
    return (
        <Base>
            <div className="ClaimContainer">
                <h3 className="card-title m-2 text-center">Certificate Claim/View Portal</h3>
                <div className="container card shadow">
                    <div className="accordion accordion-flush mt-2" id="issuerFlush">
                        <div className="accordion-item" hidden={claimStatus}>
                            <h2 className="accordion-header" id="register-heading">
                                <button className="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#register-collapse" aria-expanded="true" aria-controls="register-collapse">
                                    Claim your certificate
                                </button>
                            </h2>
                            <div id="register-collapse" className="accordion-collapse show" aria-labelledby="register-heading" data-bs-parent="#issuerFlush">
                                <div className="accordion-body">
                                    <form className="m-2" style={{ height: '100%' }} onSubmit={claimCertifcate}>
                                        <div className="mb-3">
                                            <label htmlFor="passwordInput" className="form-label">Secret Password</label>
                                            <input id="passwordInput" aria-describedby="passwordInputHelp" type='text'
                                                className="form-control"
                                                value={secretPassword}
                                                onChange={(event) => setSecretPasword(event.target.value)}
                                                required
                                            />
                                            <div id="passwordInputHelp" className="form-text">First 4 Capital letters of your First Name & Last 4 Digit of your EnrolmentId
                                                e.g"Your First name is "Harsh" & EnrolmentId is "130130117045" Your secret password is "HARS7045" "</div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="PINInput" className="form-label">Secret PIN</label>
                                            <input id="PINInput" aria-describedby="PINInputHelp" type='text'
                                                className="form-control"
                                                value={secretPIN}
                                                onChange={(event) => setSecretPIN(event.target.value)}
                                                required
                                            />
                                            <div id="PINInputHelp" className="form-text">Enter PIN shown in certificate</div>
                                        </div>
                                        <span className="text-danger" hidden={!errorMessage}>{errorMessage}</span>
                                        <div className="mb-3 d-flex" style={{ alignItems: 'center' }}>
                                            <button type="submit" className="btn btn-dark form-control" disabled={(!loading)}>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" hidden={loading}></span>
                                                Claim Certificate</button>
                                        </div>
                                        <div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="accordion-item" hidden={!claimStatus}>
                            <h2 className="accordion-header" id="create-heading">
                                <button className="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#create-collapse" aria-expanded="true" aria-controls="create-collapse">
                                    Check Authenticity Of Certificate
                                </button>
                            </h2>
                            <div id="create-collapse" className="accordion-collapse show" aria-labelledby="create-heading" data-bs-parent="#issuerFlush">
                                <div className="accordion-body">
                                    <form className="m-2" style={{ height: '100%' }} onSubmit={checkAuthenticity} hidden={verificationStatus}>
                                        <div className="mb-3">
                                            <label htmlFor="PINInput" className="form-label">Secrect PIN</label>
                                            <input id="PINInput" aria-describedby="PINInputHelp" type='text'
                                                className="form-control"
                                                value={secretPIN}
                                                onChange={(event) => setSecretPIN(event.target.value)}
                                                required
                                            />
                                            <div id="PINInputHelp" className="form-text">Enter PIN shown in certificate</div>
                                        </div>
                                        <span className="text-danger" hidden={!errorMessage}>{errorMessage}</span>
                                        <div className="mb-3 d-flex" style={{ alignItems: 'center' }}>
                                            <button type="submit" className="btn btn-dark form-control" disabled={(!loading)}>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" hidden={loading}></span>
                                                Check Authenticity</button>
                                        </div>
                                        <div>
                                        </div>
                                    </form>
                                    <div hidden={!verificationStatus}>
                                        <hr className="bg-danger border-2 border-top border-danger mb-3"></hr>
                                        <div className="row mb-3">
                                            <label htmlFor="fullname" className="form-label col-lg-4">Full Name</label>
                                            <div className="col-lg-6 col-sm-4">
                                                <span id="fullname" aria-describedby="fullnameHelp" type='text'>
                                                    {fullName}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="enrolmentid" className="form-label col-lg-4">Enrolment Id</label>
                                            <div className="col-lg-6 col-sm-4">
                                                <span id="enrolmentid" aria-describedby="enrolmentidHelp" type='text'>
                                                    {enrolmentId}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="companyName" className="form-label col-lg-4">Certificate Issuer Name</label>
                                            <div className="col-lg-6 col-sm-4">
                                                <span id="companyName" aria-describedby="companyNameHelp" type='text'>
                                                    {companyName}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="issuerStatus" className="form-label col-lg-4">Authenticity</label>
                                            <div className="col-lg-6 col-sm-4">
                                                <span id="issuerStatus" aria-describedby="issuerStatusHelp" type='text' className="text-success fw-bold">
                                                    Verifyed by Onescan
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Base>
    )
}

export default Claim