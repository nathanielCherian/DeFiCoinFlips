import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import { Address, BITBOX } from 'bitbox-sdk'

import {
    CashCompiler,
    ElectrumNetworkProvider,
    Contract,
    SignatureTemplate,
  } from 'cashscript'

const Bitcoin = require("@bitcoin-dot-com/bitcoincashjs2-lib")


export default class TestContract extends React.Component{

    
    componentDidMount(){
        /*
        this.start().then(response=>{
            console.log(response);
        });*/
    }



    async compileContract(){


        const contractData = `
        pragma cashscript ^0.5.6;

        contract TransferWithTimeout(pubkey sender, pubkey recipient, int timeout) {
            // Allow the recipient to claim their received money
            function transfer(sig recipientSig) {
                require(checkSig(recipientSig, recipient));
            }

            // Allow the sender to reclaim their sent money after the timeout is reached
            function timeout(sig senderSig) {
                require(checkSig(senderSig, sender));
                require(tx.time >= timeout);
            }
        }
        `

        const bitbox = new BITBOX();

        const seed1: string = "seed1";
        var alicePk: Buffer;
        const seed2: string = "seed2";
        var bobPk: Buffer;

        {
            const rootSeed = bitbox.Mnemonic.toSeed(seed1);
            const hdNode = bitbox.HDNode.fromSeed(rootSeed, 'testnet');
            const alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
            alicePk = bitbox.ECPair.toPublicKey(alice)
            //console.log(bitbox.ECPair.toCashAddress(alice));
            //console.log("alicepk: ", Buffer.from(alicePk).toString('hex'));

            /*
            const ecpair = Bitcoin.ECPair.fromPublicKeyBuffer(alicePk, Bitcoin.networks.testnet)
            console.log(ecpair)
            console.log(bitbox.ECPair.toCashAddress(ecpair));
            */
        }

        {
            const rootSeed = bitbox.Mnemonic.toSeed(seed2);
            const hdNode = bitbox.HDNode.fromSeed(rootSeed, 'testnet');
            const bob = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
            bobPk = bitbox.ECPair.toPublicKey(bob)
        }

        console.log("alicepk: ", Buffer.from(alicePk).toString('hex'))
        console.log("bobpk: ", Buffer.from(bobPk).toString('hex'))


        const provider = new ElectrumNetworkProvider('testnet')
        const artifact = CashCompiler.compileString(contractData);

        const contract = new Contract(artifact, [alicePk, bobPk, 600000], provider)
        console.log("contractScript: ", contract.getRedeemScriptHex());
        console.log("contractScriptHash: ", Buffer.from(bitbox.Crypto.hash160(Buffer.from(contract.getRedeemScriptHex(), "hex"))).toString('hex'));
        console.log("contractaddr: ", contract.address);
        console.log("contractbalance: ", await contract.getBalance());

    }


    render(){

        return(
            <div>
                <button onClick={()=>this.compileContract()}>Compile Contract!</button>
            </div>
        )
    }

}