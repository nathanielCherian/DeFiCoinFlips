var Script = require('bitbox-sdk').Script;
var Crypto = require('bitbox-sdk').Crypto;

var cashscript = require('cashscript');

class RandomOracle{

    constructor(keypair){
        this.keypair = keypair;
    }

    createMessage(blockHeight, randomNumber){
        const lhs = Buffer.alloc(4,0);
        const rhs = Buffer.alloc(4,0);
        new Script().encodeNumber(blockHeight).copy(lhs);
        new Script().encodeNumber(randomNumber).copy(rhs);
        return Buffer.concat([lhs, rhs]);
    }

    signMessage(message){
        return this.keypair.sign(new Crypto().sha256(message), cashscript.SignatureAlgorithm.SCHNORR).toRSBuffer();
    }

}

module.exports = RandomOracle;