import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { BITBOX } from 'bitbox-sdk'
import { CashCompiler, Contract, ElectrumNetworkProvider, SignatureTemplate } from 'cashscript';

interface AppState {
    contract?:Contract,
    balance?: number,
    playerSeed:string,
    receiveAddress:string,
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

        contract SendToWinner(pubkey player1Pk, pubkey player2Pk) {

            function collect(sig playerSig, int playerNum){
                if(playerNum == 0){

                    require(checkSig(playerSig, player1Pk));
    
                }else if(playerNum == 1){
    
                    require(checkSig(playerSig, player2Pk));
                    
    
                }else{
                    require(false);
                }
            }

        }
        `
        const bitbox = new BITBOX();

        const player1 = this.createPairfromSeed("seed1");
        const player2 = this.createPairfromSeed("seed2");


        const provider = new ElectrumNetworkProvider('testnet')
        const artifact = CashCompiler.compileString(source);

        //console.log(Buffer.from('024254e6a4705a492fd90cff9abe6ca763900771806a0b83fc19e9b4b3841ef159', 'hex'))

        const contract = new Contract(artifact, [bitbox.ECPair.toPublicKey(player1), bitbox.ECPair.toPublicKey(player2)], provider)
        this.setState({contract})
        console.log("contractScript: ", contract.getRedeemScriptHex());
        console.log("contractScriptHash: ", Buffer.from(bitbox.Crypto.hash160(Buffer.from(contract.getRedeemScriptHex(), "hex"))).toString('hex'));
        console.log("contractaddr: ", contract.address);
        console.log("contractsize: ", contract.bytesize);
        console.log("contractbalance: ", await contract.getBalance());
        console.log("utxos: ", await contract.getUtxos());

    }

    createPairfromSeed(seed:string){
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
        const pair = this.createPairfromSeed(seed);
        const transactionDetails = await contract.functions
            .collect(new SignatureTemplate(pair), 0)
            .to(this.state.receiveAddress, 700)
            .build();
        console.log(transactionDetails);

        const txDetails = await contract.functions
            .collect(new SignatureTemplate(pair), 0)
            .to(this.state.receiveAddress, 700)
            .send();
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
