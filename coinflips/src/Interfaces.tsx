interface WagerData {
    amount?:number,
    socketID?:string,
    player1?:{socket:string, pK?:Buffer, ready?:boolean}
    player2?:{socket:string, pk?:Buffer, ready?:boolean}
    timeCreated?:number,
    open?:boolean
}

export default WagerData