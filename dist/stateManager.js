"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readState = readState;
exports.writeState = writeState;
// In src/stateManager.ts
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const path_1 = __importDefault(require("path"));
const fs = {
    readFile: util_1.default.promisify(fs_1.default.readFile),
    writeFile: util_1.default.promisify(fs_1.default.writeFile),
};
// import { PublicKey } from "@solana/web3.js"; // Not needed if state stores strings
const STATE_FILE_PATH = path_1.default.resolve(process.cwd(), "bot_state.json");
console.log("DEBUG stateManager.ts - Resolved STATE_FILE_PATH:", STATE_FILE_PATH); // Adjust path as needed
async function readState() {
    try {
        // Now `fs.readFile` returns a Promise directly
        const data = await fs.readFile(STATE_FILE_PATH, "utf-8");
        return JSON.parse(data); // data will be a string
    }
    catch (error) {
        if (error.code === "ENOENT") {
            const defaultState = {
                iteration: 0,
                createdTokenAddress: null, // Corrected field name
                currentPoolId: null,
                currentPositionId: null,
                liquidityWithdrawn: true,
            };
            await writeState(defaultState);
            return defaultState;
        }
        console.error("Failed to read state file:", error);
        throw error;
    }
}
async function writeState(state) {
    try {
        // Now `fs.writeFile` returns a Promise directly
        await fs.writeFile(STATE_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
    }
    catch (error) {
        console.error("Failed to write state file:", error);
        throw error;
    }
}
