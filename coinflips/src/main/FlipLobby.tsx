import React from 'react';
import { BITBOX, ECPair } from 'bitbox-sdk'
import WagerData from '../Interfaces';

interface PropInterface {
    socket?:any
}

interface StateInterface{
    seed:string,
    pair?:ECPair
    pK?:Buffer
    wagerData?:WagerData,
}

export default class FlipLobby extends React.Component{

    props:PropInterface = {};
    state:StateInterface = {
        seed:"",
    };

    constructor(props:any){
        super(props);
        this.props = props;
    }

    componentDidMount(){
        const socket = this.props.socket;

        socket.on('room-update', (wagerData:any)=>{
            console.log(wagerData)
        });

        socket.on('room-message', (data:any)=>{
            console.log(data.msg)
        });

    }

    createPubKey = (seed:string) =>{
        const pair = this.createPairfromSeed(seed) as ECPair;
        const bitbox = new BITBOX();
        const pK =  bitbox.ECPair.toPublicKey(pair);

        this.setState({pair, pK});
    }


    createPairfromSeed(seed:string):any{
        const bitbox = new BITBOX();
        const rootSeed = bitbox.Mnemonic.toSeed(seed);
        const hdNode = bitbox.HDNode.fromSeed(rootSeed, 'testnet');
        const pair = bitbox.HDNode.toKeyPair(bitbox.HDNode.derive(hdNode, 0));
        return pair;
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


            </div>
        )
    }


}