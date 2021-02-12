import React from 'react';
import "./openwager.css"

interface PropValues {
    wagerData?:any
    socket?:any
}

export default class OpenWager extends React.Component{

    //props:WagerData = {};
    props:PropValues = {};


    render(){
        return(
            <div className="open-wager">
                <h2>Amount: {this.props.wagerData.amount}</h2>
                <h2>Created: {new Date(this.props.wagerData.timeCreated).toUTCString()}</h2>
            </div>
        )
    }

}