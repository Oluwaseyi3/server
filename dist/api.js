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
    // Convert port to number if it's a string
    const portNumber = typeof port === 'string' ? parseInt(port, 10) : port;
    // Enable CORS for all routes (configure more specifically if needed)
    app.use((0, cors_1.default)({
        origin: true, // Allow all origins (you can restrict this to your frontend domain)
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    // Middleware to parse JSON bodies (if you add POST/PUT routes later)
    app.use(express_1.default.json());
    // Add logging middleware for debugging
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
    // Root endpoint for testing
    app.get("/", (req, res) => {
        res.json({
            message: "Raydium Bot API is running",
            timestamp: new Date().toISOString(),
            endpoints: {
                health: "/api/health",
                botState: "/api/bot-state"
            }
        });
    });
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
        res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version
        });
    });
    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error('Unhandled error:', err);
        res.status(500).json({ error: 'Internal server error' });
    });
    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });
    // CRITICAL FIX: Bind to 0.0.0.0, not just localhost
    const server = app.listen(portNumber, '0.0.0.0', () => {
        console.log(`API server listening on port ${portNumber}`);
        console.log(`Bot state available at http://localhost:${portNumber}/api/bot-state`);
        console.log(`Server bound to 0.0.0.0:${portNumber} for external access`);
    });
    // Graceful shutdown handlers
    const gracefulShutdown = (signal) => {
        console.log(`Received ${signal}, shutting down gracefully...`);
        server.close((err) => {
            if (err) {
                console.error('Error during server shutdown:', err);
                process.exit(1);
            }
            console.log('HTTP server closed.');
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
