import React from 'react';
import {TestNetWallet} from 'mainnet-js';

import {
    CashCompiler,
    ElectrumNetworkProvider,
    Contract,
    SignatureTemplate,
  } from 'cashscript'


export default class TestContract extends React.Component{

    
    componentDidMount(){
        this.start().then(response=>{
            console.log(response);
        });
    }

    async start(){

        const wallet1 = await TestNetWallet.newRandom();
        console.log(wallet1)

        const wallet2 = await TestNetWallet.newRandom();
        console.log(wallet2)


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

        const artifact = CashCompiler.compileString(contractData);
        console.log(artifact);

        const provider = new ElectrumNetworkProvider('testnet');
        const contract  = new Contract(artifact, [String(wallet1.privateKeyWif), String(wallet2.privateKeyWif), 1432431])        
        console.log(contract)

        const transferDetails = await contract.functions
            .transfer(new SignatureTemplate(String(wallet2.privateKeyWif)))
            .to(String(wallet2.cashaddr), 1000)
            .send();
        console.log(transferDetails);


        const timeoutDetails = await contract.functions
            .timeout(new SignatureTemplate(String(wallet1.privateKeyWif)))
            .to(String(wallet1.cashaddr), 1000)
            .send();

        console.log(timeoutDetails)
    }


    render(){



        return(
            <h1>Contract</h1>
        )
    }

}