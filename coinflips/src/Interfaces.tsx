interface WagerData {
    amount?:number,
    socketID?:string,
    player1?:{socket:string, pK?:Buffer}
    player2?:{socket:string, pk?:Buffer}
    timeCreated?:number,
    open?:boolean
}

export default WagerData