import { Script, Crypto, Schnorr } from 'bitbox-sdk';
import { ECPair } from 'bitcoincashjs-lib';
import { SignatureAlgorithm } from 'cashscript';

export default class RandomOracle{

    constructor(public keypair: ECPair){}

    createMessage(blockHeight:number, randomNumber:number):Buffer{
        const lhs = Buffer.alloc(4,0);
        const rhs = Buffer.alloc(4,0);
        new Script().encodeNumber(blockHeight).copy(lhs);
        new Script().encodeNumber(randomNumber).copy(rhs);
        return Buffer.concat([lhs, rhs]);
    }

    signMessage(message:Buffer):Buffer{
        return this.keypair.sign(new Crypto().sha256(message), SignatureAlgorithm.SCHNORR).toRSBuffer();
    }

}