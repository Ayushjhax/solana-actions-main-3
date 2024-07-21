import { PublicKey } from "@solana/web3.js";

export const DEFAULT_SOL_AMOUNT: number = 1.0;
export const ADMIN_ACCOUNT: PublicKey = new PublicKey("EfWsg4nbb7KXkCoTRbWfkzyfcSECFueZXtxYPxTuJkyB");
export const SENDCOIN_MINT_ADDRESS: PublicKey = new PublicKey("SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa");
export const MEMO_PROGRAM_ID: PublicKey = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export const COHERE_API_KEY = 'T7E5YdqYVduosUnRrTAGvimDFbrSXFSdUOmk3nHA';
export const WEAVIATE_API_KEY = '76320a90-53d8-42bc-b41d-678647c6672e';
export const WEAVIATE_URL = 'https://cohere-demo.weaviate.network/';

export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' },
  { value: 'hi', label: 'Hindi' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'sv', label: 'Swedish' },
  { value: 'no', label: 'Norwegian' },
  { value: 'da', label: 'Danish' },
  { value: 'fi', label: 'Finnish' },
  { value: 'pl', label: 'Polish' },
  { value: 'tr', label: 'Turkish' },
  { value: 'cs', label: 'Czech' },
  { value: 'el', label: 'Greek' },
  { value: 'he', label: 'Hebrew' },
  { value: 'hu', label: 'Hungarian' },
  { value: 'ro', label: 'Romanian' },
  { value: 'sk', label: 'Slovak' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'th', label: 'Thai' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'ms', label: 'Malay' },
  { value: 'id', label: 'Indonesian' },
];
