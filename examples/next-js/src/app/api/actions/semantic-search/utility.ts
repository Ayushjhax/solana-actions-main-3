import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
  ComputeBudgetProgram,
  TransactionInstruction
} from "@solana/web3.js";

import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction
} from "@solana/spl-token";

import { ADMIN_ACCOUNT, SENDCOIN_MINT_ADDRESS, MEMO_PROGRAM_ID } from "./const";
import weaviate from "weaviate-ts-client";
import { WEAVIATE_URL, WEAVIATE_API_KEY, COHERE_API_KEY } from "./const";

export async function createTransaction(
  connection: Connection,
  account: PublicKey,
  amount: number
) {
  const transaction = new Transaction();

  const fromTokenAccount = await getAssociatedTokenAddress(
    SENDCOIN_MINT_ADDRESS,
    account,
    false
  );

  const toTokenAccount = await getAssociatedTokenAddress(
    SENDCOIN_MINT_ADDRESS,
    ADMIN_ACCOUNT,
    false
  );

  const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
  if (!toTokenAccountInfo) {
    console.log("The recipient's associated token account doesn't exist. Creating one now...");
    const createATAIx = createAssociatedTokenAccountInstruction( 
      account,
      toTokenAccount,
      ADMIN_ACCOUNT,
      SENDCOIN_MINT_ADDRESS
    );
    transaction.add(createATAIx); 
  }

  const transferIx = createTransferInstruction(
    fromTokenAccount,
    toTokenAccount,
    account,
    BigInt(amount),
    [] 
  );

  transaction.add(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1000
    }),
    new TransactionInstruction({
      programId: new PublicKey(MEMO_PROGRAM_ID),
      data: Buffer.from("Semantic search transaction", "utf-8"),
      keys: []
    }),
    transferIx
  );

  transaction.feePayer = account;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return transaction;
}

export async function semanticSearch(query: string, resultsLang: string = '') {
  const client = weaviate.client({
    scheme: 'https',
    host: WEAVIATE_URL,
    apiKey: new weaviate.ApiKey(WEAVIATE_API_KEY),
    headers: { 'X-Cohere-Api-Key': COHERE_API_KEY },
  });

  let whereFilter = {};
  if (resultsLang) {
    whereFilter = {
      path: ["lang"],
      operator: "Equal",
      valueString: resultsLang,
    };
  }

  const response = await client.graphql
    .get()
    .withClassName('Article')
    .withFields('title url text views lang _additional { distance }')
    .withNearText({ concepts: [query] })
    .withWhere(whereFilter)
    .withLimit(5)
    .do();

  return response.data.Get.Article;
}

export async function fetchWikipediaLinks(query: string) {
  const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);
  const data = await response.json();
  return data.query.search.map((result: any) => ({
    title: result.title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`,
    snippet: result.snippet,
  }));
}