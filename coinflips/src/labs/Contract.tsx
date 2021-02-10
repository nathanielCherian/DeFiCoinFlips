import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import { BITBOX } from 'bitbox-sdk'

import {
    CashCompiler,
    ElectrumNetworkProvider,
    Contract,
    SignatureTemplate,
  } from 'cashscript'
import { ECPair } from 'bitcoincashjs-lib';

const Bitcoin = require("@bitcoin-dot-com/bitcoincashjs2-lib")


interface AppState {
    contract?: Contract
    balance?: number
    transferSeed?:string,
    timeoutSeed?:string,
    transactionLink?: string
  }

export default class TestContract extends React.Component{

    state: AppState = {
        transferSeed:"seed1",
        timeoutSeed:"seed1"
    }
    
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
        var alice: ECPair;
        const seed2: string = "seed2";
        var bobPk: Buffer;
        var bob: ECPair;

        {
            const rootSeed = bitbox.Mnemonic.toSeed(seed1);
            const hdNode = bitbox.HDNode.fromSeed(rootSeed, 'testnet');
            alice = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
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
            bob = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
            bobPk = bitbox.ECPair.toPublicKey(bob)
        }

        console.log("alicepk: ", Buffer.from(alicePk).toString('hex'))
        console.log("bobpk: ", Buffer.from(bobPk).toString('hex'))


        const provider = new ElectrumNetworkProvider('testnet')
        const artifact = CashCompiler.compileString(contractData);

        const contract = new Contract(artifact, [alicePk, bobPk, 1612913287], provider)
        console.log("contractScript: ", contract.getRedeemScriptHex());
        console.log("contractScriptHash: ", Buffer.from(bitbox.Crypto.hash160(Buffer.from(contract.getRedeemScriptHex(), "hex"))).toString('hex'));
        console.log("contractaddr: ", contract.address);
        console.log("contractbalance: ", await contract.getBalance());
        console.log("utxos: ", await contract.getUtxos());

        this.setState({contract, balance: await contract.getBalance()})
    }


    async transfer(seed:string){

        const {contract} = this.state;

        if(!contract){
            alert("Compile Contract!");
            return;
        }
        

        const bitbox = new BITBOX();

        console.log("seed: ", seed)

        const rootSeed = bitbox.Mnemonic.toSeed(seed);
        const hdNode = bitbox.HDNode.fromSeed(rootSeed, 'testnet');
        const user = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

        const transferDetails = await contract.functions
            .transfer(new SignatureTemplate(user))
            .to('bchtest:qrdgy0sft47fvsgv8zvtg7pge5vvk5428sj22awvav', 730)
            .build();
        console.log(transferDetails);

        
        
        const txDetails = await contract.functions
            .transfer(new SignatureTemplate(user))
            .to('bchtest:qrdgy0sft47fvsgv8zvtg7pge5vvk5428sj22awvav', 730)
            .send();
        console.log('https://explorer.bitcoin.com/tbch/tx/'+txDetails.txid);

    }


    async timeout(seed:string){
        const {contract} = this.state;

        if(!contract){
            alert("Compile Contract!");
            return;
        }
        

        const bitbox = new BITBOX();

        console.log("seed: ", seed);
        console.log("contractSize", contract.bytesize);

        const rootSeed = bitbox.Mnemonic.toSeed(seed);
        const hdNode = bitbox.HDNode.fromSeed(rootSeed, 'testnet');
        const user = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));

        const transferDetails = await contract.functions
            .timeout(new SignatureTemplate(user))
            .to('bchtest:qrdgy0sft47fvsgv8zvtg7pge5vvk5428sj22awvav', 700)
            .build();
        console.log(transferDetails);

        
        const txDetails = await contract.functions
            .timeout(new SignatureTemplate(user))
            .to('bchtest:qrdgy0sft47fvsgv8zvtg7pge5vvk5428sj22awvav', 700)
            .send();

        console.log('https://explorer.bitcoin.com/tbch/tx/'+txDetails.txid);
    }


    render(){

        return(
            <div>
                <button onClick={()=>this.compileContract()}>Compile Contract!</button>
                {this.state.contract && <div>Contract Address: {this.state.contract.address}</div> }
                {this.state.contract && <div>Contract Address: {this.state.balance}</div> }
                
                <div>
                    <div>
                        <label>
                            transferSeed:
                            <input type="text" value={this.state.transferSeed || ""} onChange={(event)=>{this.setState({transferSeed:event.target.value})}}/>
                        </label>
                        <button onClick={()=>this.transfer(this.state.transferSeed || "")}>transfer!</button>
                    </div>

                    <div>
                        <label>
                            timeoutSeed:
                            <input type="text" value={this.state.timeoutSeed || ""} onChange={(event)=>{this.setState({timeoutSeed:event.target.value})}}/>
                        </label>
                        <button onClick={()=>this.timeout(this.state.transferSeed || "")}>timeout!</button>
                    </div>

                </div>

            </div>
        )
    }

}