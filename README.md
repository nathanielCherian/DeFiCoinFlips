# DeFiCoinFlips

Created for CoinParty 2020 by BitcoinUnlimited

## Overview
Defi coin flips is a concept that promotes financial freedom and anti-regulation with an online betting system that is served peer-to-peer rather than from a traditional server-client model. This eliminates a single point of failure that is prevalent in many of the other online betting services today. Files are served peer-to-peer and are stored locally on the user's computer for inspection should they want to. Transactions are also handled through smart contracts that allow for total transparency and verifiability. I refrain from calling it a "casino" because in a casino one entity handles all of the player's money, but that is not true in this case. Players have total control over their own funds

## Insparation
This project was inspired mainly by the libertarian philosophies of the freedom to do with your money as you so choose. Although the concept of a fully decentralized website can be applied to many applications, I chose to implement it on an online betting system because of the tight regulations put in place by the legislature and the sketchy workarounds that many people try to go through. Players depositing bitcoin to traditional online casinos are subject to huge transaction fees and end up just leaving their coin inside the casino's wallet, which can lead to disastrous resulted (exit scam, government interference). Others choose to gamble with video game skins, but companies such as valve began to restrict the trading of these items. 

## What it does
All players must first download and install [ZeroNet](https://zeronet.io/), a peer-to-peer file torrenting service that allows websites to be served from both nowhere and everywhere simultaneously. A player visiting the site is then given the files from another user who has the source files downloaded. This player can choose to start a new game and enters the amount that they are comfortable betting. Behind the scenes, a smart contract is created that locks incoming funds and makes sure that the minimum coin requirement is met. Player #1 will send their coin to the smart contract and the lobby will be open for any other players to join. On joining, they will be prompted to send coins to the smart contract as well and the coin flip will start. The outcome of the flip is determined by the transaction hash of both players. The smart contract will then release the funds to the winning player and the cycle will repeat. All this can happen without the need for a server or an entity collecting all of the players' coin.

## How I built it + Challenges
Due to my initial lack of knowledge and late entry into the competition I was unable to finish a fully working demo of the service, but I was able to solidify the main technologies that are vital to the operation. The main challenge to figure out was the smart contracts. I had used CashScript and had to resort to trial and error to nail down the contract. Additionally, serving files peer-to-peer unlocked a whole new realm of challenges that I had to work out, mainly revolving around WebSocket Communication. The majority of the code was built in javascript with the lib-auth and CashScript packages, and the front end was written in plaintext HTML.

Declarations:
- [CashScript](https://cashscript.org/)
- [Libauth](https://github.com/bitauth/libauth)
- [Bootstrap](https://getbootstrap.com/)
- [ZeroNet](https://zeronet.io/)

## What's Next?
Due to unforeseen events and a late start, I did not have as much time as I had hoped to work on Defi Coinflips, but I plan to continue developing into the future. My beginner level in blockchain technology can be used to the advantage of the community as I am compiling all of the resources that I used in an easy to follow roadmap that can help pave the way for many others to enter the development community as well. As a project, DeFi coin flips may never in itself become a big hit but once fully implemented its usage may go far beyond a simple betting system. It could set a new standard for crypto-related websites by eliminating the central authority entirely.

