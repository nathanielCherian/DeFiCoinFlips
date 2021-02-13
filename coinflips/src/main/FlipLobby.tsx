import React from 'react';
import { BITBOX, ECPair } from 'bitbox-sdk'
import { CashCompiler, Contract, ElectrumNetworkProvider, SignatureTemplate } from 'cashscript';
import WagerData from '../Interfaces';

interface PropInterface {
    socket?:any
}

interface StateInterface{
    seed:string,
    pair?:any
    pK?:Buffer
    wagerData?:WagerData,
    contract?:Contract
    ready:boolean,
    outcome?:boolean
    message?:any
    signature?:any
    returnAddress:string
}

export default class FlipLobby extends React.Component{

    props:PropInterface = {};
    state:StateInterface = {
        seed:"",
        ready:false,
        returnAddress:""
    };

    constructor(props:any){
        super(props);
        this.props = props;
    }

    componentDidMount(){
        const socket = this.props.socket;

        socket.on('room-update', (wagerData:any)=>{
            console.log(wagerData)
            this.setState({wagerData})
        });

        socket.on('room-message', (data:any)=>{
            console.log(data.msg)
        });

        socket.on('add-contract', (data:any)=>{
            //this.setState({contract:data.contract})
            this.compileContract(data.contractData);
        });

        socket.on('start-flip', (data:any)=>{
            this.flipOutcome(data)
        })
    }

    compileContract = (data:any) => {
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
        const provider = new ElectrumNetworkProvider('testnet')
        const artifact = CashCompiler.compileString(source);
    
        console.log(this.toBuffer(data.p1K))

        const contract = new Contract(artifact, [this.toBuffer(data.p1K), this.toBuffer(data.p2K), this.toBuffer(data.opK)], provider);
        this.setState({contract});
    }

    toBuffer(ab:any) {
        var buf = Buffer.alloc(ab.byteLength);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }


    flipOutcome = (data:any) => {
        const outcome = data.outcome;
        var oc = false;
        if(outcome == 0){
            if(this.state.wagerData?.player1?.socket == this.props.socket.id){
                oc = true;
                console.log("WINNER")       
            }else{
                oc = false;
                console.log("LOSER")
            }
        }else if(outcome == 1){
            if(this.state.wagerData?.player2?.socket == this.props.socket.id){
                console.log("WINNER")
                oc = true;       
            }else{
                console.log("LOSER")
                oc = false;
            }
        }
        this.setState({outcome:oc, message:data.message, signature:data.signature})
    };


    createPubKey = (seed:string) =>{
        const pair = this.createPairfromSeed(seed) as ECPair;
        const bitbox = new BITBOX();
        const pK =  bitbox.ECPair.toPublicKey(pair);

        this.props.socket.emit('send-pK', {
            socketID:this.state.wagerData?.socketID,
            socket:this.props.socket.id,
            pK:pK
        })

        this.setState({pair, pK});
    }


    createPairfromSeed(seed:string):any{
        const bitbox = new BITBOX();
        const rootSeed = bitbox.Mnemonic.toSeed(seed);
        const hdNode = bitbox.HDNode.fromSeed(rootSeed, 'testnet');
        const pair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
        return pair;
    }
    
    
    sendReady = () => {
        this.props.socket.emit('player-ready', {socketID:this.state.wagerData?.socketID, socket:this.props.socket.id});
        this.setState({ready:true})
    }

    async claimCoin(state:any){
        const contract = state.contract as Contract;
        
        console.log(state)
        const txDetails = await contract.functions
            .collect(new SignatureTemplate(state.pair), this.toBuffer(state.signature), this.toBuffer(state.message))
            .to(state.returnAddress || "", 400)
            .send();
        console.log(txDetails.hex);
        console.log('https://explorer.bitcoin.com/tbch/tx/'+txDetails.txid);
    }


    render(){
        return(
            <div>
                
                <h1>Coin Flip Lobby</h1>

                {!this.state.pair &&
                    <div>
                        <input type="text" onChange={(event)=>{this.setState({seed:event.target.value})}}/>
                        {this.state.seed && <button onClick={()=>this.createPubKey(this.state.seed)}>Send!</button>}
                    </div>
                }


                {this.state.contract &&
                <div>
                    <h3>Send coin to {this.state.contract.address}</h3>
                    {!this.state.ready && <button onClick={this.sendReady}>Ready!</button>}                    
                </div>}

                {this.state.outcome == true && <h2>You Win!</h2>}
                {this.state.outcome == false && <h2>You Lose!</h2>}
                {this.state.outcome != null && <div>
                    <input type="text" value={this.state.returnAddress} onChange={(event)=>{this.setState({returnAddress:event.target.value})}}/>
                    <button onClick={()=>{this.claimCoin(this.state)}}>Claim Your Coin!</button>
                </div>}

            </div>
        )
    }


}