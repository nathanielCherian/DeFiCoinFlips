import React, { MouseEventHandler } from 'react';
import "./openwager.css"

interface PropValues {
    wagerData?:any
    joinWager:Function
}

export default class OpenWager extends React.Component{

    //props:WagerData = {};
    props:PropValues = {
        joinWager:()=>{}
    };

    constructor(props:any){
        super(props);
        this.props = props;
    }



    render(){

        return(
            <div className="open-wager">
                <h2>Amount: {this.props.wagerData.amount}</h2>
                <h2>Created: {new Date(this.props.wagerData.timeCreated).toUTCString()}</h2>
                {this.props.wagerData.open && <button onClick={()=>this.props.joinWager(this.props.wagerData)}>Join!</button>}
            </div>
        )
    }

}