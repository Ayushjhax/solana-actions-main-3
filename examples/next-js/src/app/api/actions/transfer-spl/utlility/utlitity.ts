import * as anchor from "@coral-xyz/anchor";
import base58 from "bs58";
import { DEFAULT_SOL_ADDRESS } from "../const"
import { ComputeBudgetProgram, Keypair, PublicKey } from "@solana/web3.js";

import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
} from "@solana/spl-token";

export async function createTransaction(
  account: string,
  amount: number

) {
  const connection = new anchor.web3.Connection(process.env.RPC_URL!);
  const wallet = new anchor.Wallet(anchor.web3.Keypair.generate());
  const provider = new anchor.AnchorProvider(connection, wallet);

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 15000,
  });

  const instructions = [addPriorityFee];

  // Add SPL Token Transfer Instruction

    const mintPublicKey = new PublicKey(
      "FSxJ85FXVsXSr51SeWf9ciJWTcRnqKFSmBgRDeL3KyWw"
    );
    const fromPublicKey = new PublicKey(account);
    const destPublicKey = DEFAULT_SOL_ADDRESS;
    const tokenTransferAmount = amount * 1e6;

    const fromTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      fromPublicKey
    );
    const destTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      destPublicKey
    );
    const receiverAccount = await connection.getAccountInfo(destTokenAccount);

    //Create associated token acoount for the reciever if they dont have
    if (receiverAccount === null) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          fromPublicKey,
          destTokenAccount,
          destPublicKey,
          mintPublicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }

    instructions.push(
      createTransferInstruction(
        fromTokenAccount,
        destTokenAccount,
        fromPublicKey,
        tokenTransferAmount
      )
    );
  

  const { blockhash } = await connection.getLatestBlockhash({
    commitment: "max",
  });

  const messageV0 = new anchor.web3.TransactionMessage({
    payerKey: fromPublicKey,
    recentBlockhash: blockhash,
    instructions: instructions,
  }).compileToV0Message();

  const versionedTransaction = new anchor.web3.VersionedTransaction(messageV0);

  const serializedTransaction = Buffer.from(
    versionedTransaction.serialize()
  ).toString("base64");
  return serializedTransaction;
}
