import { Socket } from 'dgram';
import React from 'react';
import './App.css';
import TestContract from './labs/Contract';
import RandomContract from './labs/RandomContract';
import WagerData from './Interfaces';
import OpenWager from './main/OpenWager';
import FlipLobby from './main/FlipLobby';

var socketIOClient = require("socket.io-client");


interface AppState {
  socket?: any,
  wagerDatas?:any
  inGame:boolean
}


export default class App extends React.Component{

  state: AppState = {
    inGame:false,
  }

  componentDidMount(){
    const socket = socketIOClient("http://192.168.1.22:3001/");
    socket.emit('on-start');

    this.setState({socket})

    socket.on('get-all-data', (wagerDatas: any) =>{
        this.setState({wagerDatas});
    });

    socket.on('new-wager', (wagerData:WagerData) => {
        this.state.wagerDatas[wagerData.socketID || ""] = wagerData;
        this.setState({});
      });

    socket.on('wager-joined', (data:WagerData) => {
      this.state.wagerDatas[data.socketID || ""] = data;
      this.setState({});
    });  
    
    socket.on('remove-wager', (data:{socketID:string})=>{
      delete this.state.wagerDatas[data.socketID];
      this.setState({});
    })
    
  }

  makeWager = () => {
    const socket = this.state.socket;
    const data: WagerData = {
      amount:10000,
      socketID:socket.id,
      player1:{socket:socket.id},
      player2:{socket:""},
      timeCreated:new Date().getTime(),
      open:true,
    }

    socket.emit('create-wager', data);
    this.setState({inGame:true});
  }


  joinWager = (wagerData:WagerData) => {
    wagerData.player2 = {socket:this.state.socket.id};
    this.state.socket.emit('join-wager', wagerData);
    this.setState({inGame:true})
  }

  render(){

    const wagerItems = Object.values(this.state.wagerDatas || {}).map((wagerData:any) => {
      return(
        <OpenWager wagerData={wagerData} joinWager={this.joinWager} key={wagerData.socketID}/>
      )
    });


    return (
      <div>

          {!this.state.inGame ? <div>
            <button onClick={this.makeWager}>Send</button> 
            {wagerItems}
          </div> : 
            <div>
              <FlipLobby socket={this.state.socket}/>
            </div>
          }


      </div>
    );
  }

}
