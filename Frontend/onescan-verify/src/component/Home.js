import React, { useEffect } from 'react'
import Base from './Base'
import education from '../Education.png'
import QR from '../QRHome.png'
import '../css/Home.css'


function Home() {


    return (
        <Base>
            <div className="HomeContainer">
                <div className="row mt-3 align-items-center">
                    <div className='col-6'>
                        <h1>Certification for institutions/company</h1>
                        <br />
                        <p>
                            How do you know if a document is real or fake?
                            Today we must beware of fake or manipulated credentials
                            and make verification of them a standard practice.
                        </p>
                    </div>
                    <div className='col-6'>
                        <img
                            src={education} />
                    </div>
                </div>
                <div className="row mt-3 align-items-center">
                    <h1>The Problem</h1>
                    <p>
                        In this day and age, can we trust any documents presented to us? How do you know if a document is real or fake? Forgery software is readily available and makes manipulation easy. For example, any diploma /degree document forged online and we don't have any information about it. Like, wise any other government certificate like Birth, death or marriage easily forged by anyone on the internet.
                    </p>
                </div>
                <div className="row mt-3 align-items-center">
                    <h1>The Solution</h1>
                    <div>
                        <p>
                            Blockchain helps us to minimize this type of fraud.
                            We are here to help you out.Onescan-Verify gives the unique identity of each certificate using NFTs and verifies its authenticity by scanning QR codes on it.

                        </p>
                        <br/>
                        <p className="fw bold">
                            Note: Current this demo is only for Physical certificate verification. 
                            In future this concept will helpfull for verifying authenticity of any Physical Product or Digital Certificate.
                        </p>
                    </div>
                </div>
                <div className="row mt-3 align-items-center">
                    <h1>Steps to use Onescan-Verify product</h1>
                    <div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">1. Register as an Issuer (One time registration for one company/institution)</li>
                            <li className="list-group-item">2. Onescan-Verify verifies KYC and approved your request.Now you become certified certificate Issuer (Any one can approve issuer request-As per demo purpose)</li>
                            <li className="list-group-item">3. Create new NFT contract for your certificates. Like, Diploma/Degree/Birth etc</li>
                            <li className="list-group-item">4. Generate new certificate as you require.Each certificate has uniqe identity and has uniqe QR Code on it (Please use Certificate Template and upload certificate in PDF formate only-As per demo purpose)</li>
                            <li className="list-group-item">5. Certificate's owner claim their certificate ownership by providing secret password and secret PIN (one time process by claimer)</li>
                            <li className="list-group-item">6. Any one can verify its authenticity by scanning QR code and providing secret PIN</li>
                        </ul>
                    </div>
                </div>

            </div>
        </Base>
    )
}

export default Home