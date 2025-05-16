"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupApi = setupApi;
// api.ts
const express_1 = __importDefault(require("express"));
const stateManager_1 = require("./stateManager"); // Adjust path to your stateManager
const cors_1 = __importDefault(require("cors")); // For handling Cross-Origin Resource Sharing
function setupApi(port) {
    const app = (0, express_1.default)();
    // Enable CORS for all routes (or configure more specifically)
    app.use((0, cors_1.default)());
    // Middleware to parse JSON bodies (if you add POST/PUT routes later)
    app.use(express_1.default.json());
    // Endpoint to get the bot state
    app.get("/api/bot-state", async (req, res) => {
        try {
            const state = await (0, stateManager_1.readState)();
            res.json(state);
        }
        catch (error) {
            console.error("API Error: Failed to read bot state:", error);
            res.status(500).json({ error: "Failed to retrieve bot state" });
        }
    });
    // Basic health check endpoint
    app.get("/api/health", (req, res) => {
        res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
    });
    app.listen(port, () => {
        console.log(`API server listening on port ${port}`);
        console.log(`Bot state available at http://localhost:${port}/api/bot-state`);
    });
}
