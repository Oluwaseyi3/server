"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSdk = exports.publicKey = exports.wallet = exports.exportedKeyPair = exports.SOL_DECIMALS = exports.SOL_MINT = exports.keypair = exports.REDIS_URL = exports.rpcConnection = exports.cluster = exports.SOLANA_RPC_URL = exports.TOKENB_PROGRAM_ID = exports.TOKENA_PROGRAM_ID = exports.PERP_TOKEN_DEPOSIT_PERCENTAGE = exports.SOL_AMOUNT_TO_DEPOSIT_METEORA = exports.perpTokenConfig = exports.tokenDetails = exports.RAYDIUM_PROGRAM_ID = void 0;
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const nodewallet_1 = __importDefault(require("@coral-xyz/anchor/dist/cjs/nodewallet"));
const web3_js_1 = require("@solana/web3.js");
const web3_js_2 = require("@solana/web3.js");
const dotenv_1 = require("dotenv");
const bytes_1 = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
const spl_token_1 = require("@solana/spl-token");
(0, dotenv_1.config)();
exports.RAYDIUM_PROGRAM_ID = new web3_js_2.PublicKey("CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C");
exports.tokenDetails = {
    name: "Example Token",
    symbol: "EXT",
    uri: "https://example.com/token-metadata.json",
    decimals: 9,
    supply: 1000000000,
    description: "A sample token used for demonstration purposes.",
};
exports.perpTokenConfig = {
    uri: "https://raw.githubusercontent.com/Oluwaseyi3/metadata/refs/heads/main/meta", // URI for the PERP token metadata
    decimals: 9, // Decimals for the new PERP tokens
    supply: 1000000000, // Initial and total supply of each PERP token (in whole units)
    description: "A sample token used for demonstration purposes.",
    image: "https://res.cloudinary.com/seyi-codes/image/upload/v1747102661/APbP7hYraQeMQ4y8apApy3zeeHCkNcd6_v1qvcj.png",
    twitter: "https://x.com/PerpRug",
    telegram: "https://t.me/PerpRug",
    website: "https://perprug.fun",
};
exports.SOL_AMOUNT_TO_DEPOSIT_METEORA = 0.03;
exports.PERP_TOKEN_DEPOSIT_PERCENTAGE = 0.99; // e.g., deposit 99% of the new PERP token
exports.TOKENA_PROGRAM_ID = spl_token_1.TOKEN_PROGRAM_ID;
exports.TOKENB_PROGRAM_ID = spl_token_1.TOKEN_PROGRAM_ID;
exports.SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
exports.cluster = exports.SOLANA_RPC_URL.includes("devnet") ? "devnet" : "mainnet";
exports.rpcConnection = new web3_js_1.Connection(exports.SOLANA_RPC_URL, "confirmed");
const base58SecretKey = process.env.PRIVATE_KEY;
exports.REDIS_URL = String(process.env.REDIS_URL);
let secretKey;
if (!base58SecretKey) {
    secretKey = [
        155, 155, 198, 61, 159, 253, 179, 138, 206, 173, 12, 65, 216, 12, 138, 80,
        198, 230, 229, 96, 154, 189, 21, 172, 124, 243, 223, 4, 131, 64, 209, 130,
        234, 151, 250, 200, 206, 179, 147, 169, 86, 52, 158, 181, 159, 246, 8, 192,
        208, 12, 166, 129, 34, 88, 7, 137, 134, 184, 232, 98, 102, 164, 158, 72,
    ];
}
else {
    secretKey = bytes_1.bs58.decode(base58SecretKey);
}
exports.keypair = {
    secretKey: secretKey,
};
exports.SOL_MINT = "So11111111111111111111111111111111111111112";
exports.SOL_DECIMALS = 9;
exports.exportedKeyPair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(exports.keypair.secretKey));
exports.wallet = new nodewallet_1.default(web3_js_1.Keypair.fromSecretKey(new Uint8Array(exports.keypair.secretKey)));
exports.publicKey = "Gnkp9MZSFAs6af6i6zYZJFHMb5RaezXZiKUBRKXTmqbM";
let raydium;
const initSdk = async (params) => {
    if (raydium)
        return raydium;
    if (exports.rpcConnection.rpcEndpoint === exports.rpcConnection.rpcEndpoint)
        console.warn("using free rpc node might cause unexpected error, strongly suggest uses paid rpc node");
    console.log(`connect to rpc ${exports.rpcConnection.rpcEndpoint} in ${exports.cluster}`);
    raydium = await raydium_sdk_v2_1.Raydium.load({
        owner: params?.owner || exports.wallet.payer,
        connection: exports.rpcConnection,
        cluster: exports.cluster,
        disableFeatureCheck: true,
        disableLoadToken: !params?.loadToken,
        blockhashCommitment: "finalized",
        // urlConfigs: {
        //   BASE_HOST: '<API_HOST>', // api url configs, currently api doesn't support devnet
        // },
    });
    return raydium;
};
exports.initSdk = initSdk;
