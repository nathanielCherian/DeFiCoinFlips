var BITBOX = require('bitbox-sdk').BITBOX;
var cashscript = require('cashscript');

var ElectrumNetworkProvider = cashscript.ElectrumNetworkProvider;
var CashCompiler = cashscript.CashCompiler;
var Contract = cashscript.Contract;

function createContract(pK1, pK2, opK){

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

    const contract = new Contract(artifact, [pK1, pK2, opK], provider)

    return contract;
}



module.exports = createContract;