import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { BITBOX } from 'bitbox-sdk'
import { CashCompiler, Contract, ElectrumNetworkProvider, SignatureTemplate } from 'cashscript';

import RandomOracle from './Oracle';
import { ECPair } from 'bitcoincashjs-lib';

interface AppState {
    contract?:Contract,
    balance?: number,
    playerSeed:string,
    receiveAddress:string,
    oraclePair?:ECPair
    transactionLink?: string
  }

export default class RandomContract extends React.Component{

    state:AppState = {
        playerSeed:"seed1",
        receiveAddress:"bchtest:qpu6kctv7rtg524zs3kg0dmac9kt7dm8d5jqv2uw47"
    }

    async compileContract(){
    
        const source = `
        pragma cashscript ^0.5.6;

        contract SendToWinner(pubkey player1Pk, pubkey player2Pk, pubkey oraclePk) {

            function collect(sig playerSig, datasig oracleSig, bytes oracleMessage){

                require(checkDataSig(oracleSig, oracleMessage, oraclePk));

                int blockHeight = int(oracleMessage.split(4)[0]);
                int randomNumber = int(oracleMessage.split(4)[1]);

                require(tx.time >= blockHeight);
                
                //int playerNum = 0;

                if(randomNumber == 0){
                    require(checkSig(playerSig, player1Pk));
                }else if(randomNumber == 1){
                    require(checkSig(playerSig, player2Pk));
                }else{
                    require(false);
                }
            }

        }
        `
        
        const oraclePair = this.createPairfromSeed("oracle");
        this.setState({oraclePair})

        const bitbox = new BITBOX();

        const player1 = this.createPairfromSeed("seed1");
        const player2 = this.createPairfromSeed("seed2");


        const provider = new ElectrumNetworkProvider('testnet')
        const artifact = CashCompiler.compileString(source);

        //console.log(Buffer.from('024254e6a4705a492fd90cff9abe6ca763900771806a0b83fc19e9b4b3841ef159', 'hex'))

        const contract = new Contract(artifact, [bitbox.ECPair.toPublicKey(player1), bitbox.ECPair.toPublicKey(player2), bitbox.ECPair.toPublicKey(oraclePair)], provider)
        this.setState({contract})
        console.log("contractScript: ", contract.getRedeemScriptHex());
        console.log("contractScriptHash: ", Buffer.from(bitbox.Crypto.hash160(Buffer.from(contract.getRedeemScriptHex(), "hex"))).toString('hex'));
        console.log("contractaddr: ", contract.address);
        console.log("contractsize: ", contract.bytesize);
        console.log("contractbalance: ", await contract.getBalance());
        console.log("utxos: ", await contract.getUtxos());

    }

    createPairfromSeed(seed:string):ECPair{
        const bitbox = new BITBOX();
        const rootSeed = bitbox.Mnemonic.toSeed(seed);
        const hdNode = bitbox.HDNode.fromSeed(rootSeed, 'testnet');
        const pair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
        return pair;
    }


    async collect(seed:string){
        const {contract} = this.state;

        if(!contract){
            alert("Compile Contract!");
            return;
        }

        console.log(seed)

        const oraclePair = this.state.oraclePair as ECPair;
        const oracle = new RandomOracle(oraclePair);
        const message = oracle.createMessage(14000, 0);
        const signature = oracle.signMessage(message);

        const pair = this.createPairfromSeed(seed);
        /*
        const transactionDetails = await contract.functions
            .collect(new SignatureTemplate(pair), signature, message)
            .to(this.state.receiveAddress, 600)
            .build();
        console.log(transactionDetails);
        */
        
        const txDetails = await contract.functions
            .collect(new SignatureTemplate(pair), signature, message)
            .to(this.state.receiveAddress, 500)
            .withHardcodedFee(100)
            .send();
        console.log(txDetails.hex);
        console.log('https://explorer.bitcoin.com/tbch/tx/'+txDetails.txid);
    }

    render(){
        return(
            <div>
                <h1>Random-Based Contract</h1>

                <button onClick={()=>this.compileContract()}>Compile Contract!</button>

                <div>
                    <label>
                        Recieve Address:
                        <input type="text" value={this.state.receiveAddress} onChange={(event)=>this.setState({receiveAddress:event.target.value})}/>
                    </label>
                    <br></br>
                    <label>
                        Seed:
                        <input type="text" value={this.state.playerSeed} onChange={(event)=>this.setState({playerSeed:event.target.value})}/>
                    </label>
                    <br></br>
                    <button onClick={()=>this.collect(this.state.playerSeed)}>Collect Funds!</button>
                </div>

            </div>
        )
    }

}
