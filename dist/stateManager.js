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
function readState() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Now `fs.readFile` returns a Promise directly
            const data = yield fs.readFile(STATE_FILE_PATH, "utf-8");
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
                yield writeState(defaultState);
                return defaultState;
            }
            console.error("Failed to read state file:", error);
            throw error;
        }
    });
}
function writeState(state) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Now `fs.writeFile` returns a Promise directly
            yield fs.writeFile(STATE_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
        }
        catch (error) {
            console.error("Failed to write state file:", error);
            throw error;
        }
    });
}
