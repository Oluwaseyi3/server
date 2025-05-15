"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidCpmm = void 0;
exports.sleep = sleep;
exports.getSPLBalance = getSPLBalance;
exports.uploadMetadata = uploadMetadata;
exports.getLatestBlockhash = getLatestBlockhash;
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const spl_token_1 = require("@solana/spl-token");
const pinata_1 = require("pinata");
const constants_1 = require("./constants");
const VALID_PROGRAM_ID = new Set([
    raydium_sdk_v2_1.CREATE_CPMM_POOL_PROGRAM.toBase58(),
    raydium_sdk_v2_1.DEV_CREATE_CPMM_POOL_PROGRAM.toBase58(),
]);
const isValidCpmm = (id) => VALID_PROGRAM_ID.has(id);
exports.isValidCpmm = isValidCpmm;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Gets the token balance for an account
 * @param connection RPC connection
 * @param mintAddress The token mint address
 * @param pubKey The account public key
 * @param allowOffCurve Whether to allow off-curve addresses
 * @returns Token balance as bigint
 */
function getSPLBalance(connection_1, mintAddress_1, pubKey_1) {
    return __awaiter(this, arguments, void 0, function* (connection, mintAddress, pubKey, allowOffCurve = false) {
        try {
            console.log(mintAddress.toString(), pubKey.toString());
            const ata = (0, spl_token_1.getAssociatedTokenAddressSync)(mintAddress, pubKey, allowOffCurve);
            const balance = yield connection.getTokenAccountBalance(ata, "confirmed");
            return balance.value.uiAmount;
        }
        catch (error) {
            console.error(error);
            // Account might not exist, which is fine
            return 0;
        }
    });
}
function uploadMetadata(metadata) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pinata = new pinata_1.PinataSDK({
                pinataJwt: process.env.PINATA_JWT,
                pinataGateway: process.env.PINATA_GATEWAY,
            });
            const upload = yield pinata.upload.public.json(metadata);
            return `https://gateway.pinata.cloud/ipfs/${upload.cid}`;
        }
        catch (error) {
            console.error(error);
            return "";
        }
    });
}
function getLatestBlockhash() {
    return __awaiter(this, void 0, void 0, function* () {
        const blockhash = yield constants_1.rpcConnection.getLatestBlockhash();
        return blockhash.blockhash;
    });
}
