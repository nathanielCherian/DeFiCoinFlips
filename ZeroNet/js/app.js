import { PrivateKey } from "bitcore-lib-cash";

let NETWORK_URL = "https://bchd.ny1.simpleledger.io"

if (localStorage.getItem("DeFiCoinFlips") == null) {
    this.pk = new PrivateKey();
    localStorage.setItem("DeFiCoinFlips", this.pk.toWIF());
} else {
    this.pk = new PrivateKey(localStorage.getItem("DeFiCoinFlips")!);
}

this.state = {
    showPrivKey: false,
    showSlpAddressFormat: false,
    address: this.pk.toAddress().toCashAddress(),
    useMainnet: true,
    checkingBalance: true,
    networkUrl: NETWORK_URL,
    bchCoins: new Map<outpoint, Big>(),
    tokenMetadata: new Map<tokenId, TokenMetadata>()
};

