import { Socket } from 'dgram';
import React from 'react';
import './App.css';
import TestContract from './labs/Contract';
import RandomContract from './labs/RandomContract';
import WagerData from './Interfaces';
import OpenWager from './main/OpenWager';

var socketIOClient = require("socket.io-client");


interface AppState {
  socket?: any,
  wagerDatas?:object
}


export default class App extends React.Component{

  state: AppState = {}

  componentDidMount(){
    const socket = socketIOClient("http://localhost:3001/");
    socket.emit('on-start');

    this.setState({socket})

    socket.on('get-all-data', (wagerDatas: any) =>{
        console.log(wagerDatas);
        this.setState({wagerDatas});
    });

  }

  makeWager = () => {

    const socket = this.state.socket;
    const data: WagerData = {
      amount:10000,
      socketID:socket.id,
      timeCreated:new Date().getTime(),
      open:true,
    }

    socket.emit('create-wager', data)

  }


  render(){

    const wagerItems = Object.values(this.state.wagerDatas || {}).map((wagerData) => {
      return(
        <OpenWager wagerData={wagerData} socket={this.state.socket}/>
      )
    });


    return (
      <div>
          <button onClick={this.makeWager}>Send</button>

          {wagerItems}

      </div>
    );
  }

}
