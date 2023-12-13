import fs from 'fs';
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.fromSecretKey(
  //input private key here
  bs58.decode("3TL4dcSkWfzJ2CDjfkNNMt5qbs55sunhduZKQzCiXXnSFXNrLhw6evYMeggGKDC9YqVjXU6oqi3WLCkRKaH2MR59")
);
console.log(keypair)

fs.writeFileSync(
  "keypair.json",JSON.stringify(
    Array.from(keypair.secretKey),
  ))