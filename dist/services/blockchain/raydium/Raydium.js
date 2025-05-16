"use strict";
// raydium_integration.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumClient = void 0;
const web3_js_1 = require("@solana/web3.js");
const umi_1 = require("@metaplex-foundation/umi");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const umi_bundle_defaults_1 = require("@metaplex-foundation/umi-bundle-defaults");
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const constants_1 = require("../../../constants");
const anchor_1 = require("@coral-xyz/anchor");
const utils_1 = require("../../../utils");
const decimal_js_1 = __importDefault(require("decimal.js"));
class RaydiumClient {
    constructor(walletSecret) {
        this.connection = constants_1.rpcConnection;
        this.umi = (0, umi_bundle_defaults_1.createUmi)(constants_1.SOLANA_RPC_URL).use((0, mpl_token_metadata_1.mplTokenMetadata)());
        const userWallet = this.umi.eddsa.createKeypairFromSecretKey(new Uint8Array(walletSecret));
        this.wallet = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(walletSecret));
        const userWalletSigner = (0, umi_1.createSignerFromKeypair)(this.umi, userWallet);
        this.umi.use((0, umi_1.signerIdentity)(userWalletSigner));
    }
    /**
     * Create a new SPL token mint and attach metadata
     * @param supply - initial token supply
     * @param decimals - decimal places
     * @param metadataUri - URI pointing to JSON metadata
     * @param metadataData - metadata fields (name, symbol, etc.)
     * @returns PublicKey of the new mint
     */
    async createTokenWithMetadata(opts) {
        try {
            const mint = (0, umi_1.generateSigner)(this.umi);
            const metadata = {
                name: opts.name,
                symbol: opts.symbol,
                description: opts.description || "",
                image: opts.image || "",
                website: opts.website || "",
                twitter: opts.twitter || "",
                telegram: opts.telegram || "",
            };
            const uri = await (0, utils_1.uploadMetadata)(metadata);
            // const uri = "";
            console.log(`Successfully uploaded metadata to ${uri}`);
            const totalSupplyWithDecimals = new decimal_js_1.default(opts.supply || 10000000000)
                .mul(10 ** (opts.decimals || 9))
                .toNumber();
            if (constants_1.cluster == "mainnet") {
                const tx = await (0, mpl_token_metadata_1.createAndMint)(this.umi, {
                    mint,
                    authority: this.umi.identity,
                    name: opts.name,
                    symbol: opts.symbol,
                    uri: uri,
                    sellerFeeBasisPoints: (0, umi_1.percentAmount)(0),
                    decimals: opts.decimals || 6,
                    amount: totalSupplyWithDecimals,
                    //@ts-ignore
                    tokenOwner: this.wallet.publicKey,
                    tokenStandard: mpl_token_metadata_1.TokenStandard.Fungible,
                }).sendAndConfirm(this.umi);
                console.log("Successfully minted 1 million tokens (", mint.publicKey, ")");
                return { mintAddress: mint.publicKey.toString(), txId: tx.signature };
            }
            else {
                const tx = await (0, mpl_token_metadata_1.createAndMint)(this.umi, {
                    mint,
                    authority: this.umi.identity,
                    name: opts.name,
                    symbol: opts.symbol,
                    uri: uri,
                    sellerFeeBasisPoints: (0, umi_1.percentAmount)(0),
                    decimals: opts.decimals || 6,
                    amount: totalSupplyWithDecimals,
                    //@ts-ignore
                    tokenOwner: this.wallet.publicKey,
                    tokenStandard: mpl_token_metadata_1.TokenStandard.Fungible,
                    feePayer: this.umi.identity,
                }).send(this.umi);
                console.log("Successfully minted 1 million tokens (", mint.publicKey, ")");
                return { mintAddress: mint.publicKey.toString(), txId: tx };
            }
        }
        catch (error) {
            console.error("Error minting tokens:", error);
        }
    }
    /**
     * Create a CPMM pool on Raydium between two tokens
     * @param tokenA - PublicKey string of base mint
     * @param tokenB - PublicKey string of quote mint
     * @param amountA - base token amount in raw units
     * @param amountB - quote token amount in raw units
     * @returns PublicKey of the created pool
     */
    async createPool(opts) {
        const raydium = await (0, constants_1.initSdk)();
        const feeConfigs = await raydium.api.getCpmmConfigs();
        if (raydium.cluster === "devnet") {
            feeConfigs.forEach((config) => {
                config.id = (0, raydium_sdk_v2_1.getCpmmPdaAmmConfigId)(raydium_sdk_v2_1.DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, config.index).publicKey.toBase58();
            });
        }
        const mintA = await raydium.token.getTokenInfo(opts.tokenA);
        const mintB = await raydium.token.getTokenInfo(opts.tokenB);
        const inputAAmount = new anchor_1.BN(new decimal_js_1.default(opts.mintAamount).mul(10 ** mintA.decimals).toFixed(0));
        const inputBAmount = new anchor_1.BN(new decimal_js_1.default(opts.mintBamount).mul(10 ** mintB.decimals).toFixed(0));
        const { execute, extInfo } = await raydium.cpmm.createPool({
            // poolId: // your custom publicKey, default sdk will automatically calculate pda pool id
            programId: raydium.cluster === "devnet"
                ? raydium_sdk_v2_1.DEV_CREATE_CPMM_POOL_PROGRAM
                : raydium_sdk_v2_1.CREATE_CPMM_POOL_PROGRAM, // devnet: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM
            poolFeeAccount: raydium.cluster === "devnet"
                ? raydium_sdk_v2_1.DEV_CREATE_CPMM_POOL_FEE_ACC
                : raydium_sdk_v2_1.CREATE_CPMM_POOL_FEE_ACC, // devnet:  DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC
            mintA,
            mintB,
            mintAAmount: new anchor_1.BN(inputAAmount),
            mintBAmount: new anchor_1.BN(inputBAmount),
            startTime: new anchor_1.BN(0),
            feeConfig: feeConfigs[0],
            associatedOnly: false,
            ownerInfo: {
                useSOLBalance: true,
            },
            txVersion: raydium_sdk_v2_1.TxVersion.V0,
        });
        const poolKeys = Object.keys(extInfo.address).reduce((acc, cur) => ({
            ...acc,
            [cur]: extInfo.address[cur].toString(),
        }), {});
        if (constants_1.cluster == "devnet") {
            const { txId } = await execute();
            console.log("pool created", {
                txId,
                poolKeys,
            });
            return {
                poolId: poolKeys?.poolId,
                txId,
            };
        }
        else {
            const { txId } = await execute({ sendAndConfirm: true });
            console.log("pool created", {
                txId,
                poolKeys,
            });
            return {
                poolId: poolKeys?.poolId,
                lpMint: new web3_js_1.PublicKey(poolKeys?.lpMint),
                txId,
            };
        }
    }
    /**
     * Deposit liquidity into a CPMM pool
     * @param poolId - PublicKey string of the pool
     * @param tokenMint - which token side (base or quote)
     * @param amount - amount in raw units
     */
    async deposit(poolId, amount) {
        const raydium = await (0, constants_1.initSdk)();
        let poolInfo;
        let poolKeys;
        if (raydium.cluster === "mainnet") {
            const data = await raydium.api.fetchPoolById({ ids: poolId });
            poolInfo = data[0];
            if (!(0, utils_1.isValidCpmm)(poolInfo.programId))
                throw new Error("target pool is not CPMM pool");
        }
        else {
            const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
            poolInfo = data.poolInfo;
            poolKeys = data.poolKeys;
        }
        const inputAmount = new anchor_1.BN(new decimal_js_1.default(amount).mul(10 ** poolInfo.mintA.decimals).toFixed(0));
        const slippage = new raydium_sdk_v2_1.Percent(1, 100); // 1%
        const baseIn = true;
        const { execute } = await raydium.cpmm.addLiquidity({
            poolInfo,
            poolKeys,
            inputAmount,
            slippage,
            baseIn,
            txVersion: raydium_sdk_v2_1.TxVersion.V0,
        });
        const { txId } = await execute({ sendAndConfirm: true });
        console.log(`pool deposited`, {
            txId,
        });
        return { txId };
    }
    /**
     * Withdraw liquidity from a CPMM pool
     * @param poolId - PublicKey string of the pool
     * @param lpAmount - amount of LP tokens to burn
     */
    async withdraw(poolId, lpAmount) {
        const raydium = await (0, constants_1.initSdk)();
        let poolInfo;
        let poolKeys;
        if (raydium.cluster === "mainnet") {
            const data = await raydium.api.fetchPoolById({ ids: poolId });
            poolInfo = data[0];
            if (!(0, utils_1.isValidCpmm)(poolInfo.programId))
                throw new Error("target pool is not CPMM pool");
        }
        else {
            const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
            poolInfo = data.poolInfo;
            poolKeys = data.poolKeys;
        }
        const slippage = new raydium_sdk_v2_1.Percent(1, 100); // 1%
        const inputamount = new anchor_1.BN(new decimal_js_1.default(lpAmount).mul(10 ** 9).toFixed(0));
        const { execute } = await raydium.cpmm.withdrawLiquidity({
            poolInfo,
            poolKeys,
            lpAmount: inputamount,
            txVersion: raydium_sdk_v2_1.TxVersion.V0,
            slippage,
        });
        if (constants_1.cluster == "mainnet") {
            const { txId } = await execute({ sendAndConfirm: true });
            console.log("pool withdraw:", {
                txId: `${txId}`,
            });
            return { txId };
        }
        else {
            const { txId } = await execute();
            console.log("pool withdraw:", {
                txId: `${txId}`,
            });
            return { txId };
        }
    }
}
exports.RaydiumClient = RaydiumClient;
