const Mainnet = require('mainnet-js');

class Lobby{

    constructor({color, wager, addr}, ws){
        this._init();

        this.wager = wager;

        this.data = {};
        this.data[color] = {
            "addr":addr,
            "ws":ws
        }


        this.open = true;
    }   

    addPlayer(addr, ws){
        let color;
        if("black" in this.data){
            color = "red";
        }else{
            color = "black";
        }

        this.data[color] = {
            "addr":addr,
            "ws":ws
        };

        this.open = false;

    }


    sendMsg(msg){
        for(const key of Object.keys(this.data)){
            const ws = this.data[key].ws;
            ws.send("hello there!");
        }

    }


    toJSON(){
        console.log(this.wallet)
        const msg = {
            wallet:this.wallet.cashaddr,
            open:this.open,
            wager:this.wager,
            colors:Object.keys(this.data)
        }

        return JSON.stringify(msg)
    }

    async _init() {
        this.wallet = await Mainnet.TestNetWallet.newRandom();
    }

}

module.exports = Lobby;