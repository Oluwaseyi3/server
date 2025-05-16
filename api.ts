// api.ts
import express, { Express, Request, Response } from "express";
import { readState, BotState } from "./stateManager"; // Adjust path to your stateManager
import cors from "cors"; // For handling Cross-Origin Resource Sharing

export function setupApi(port: string | number): void {
    const app: Express = express();

    // Convert port to number if it's a string
    const portNumber = typeof port === 'string' ? parseInt(port, 10) : port;

    // Enable CORS for all routes (configure more specifically if needed)
    app.use(cors({
        origin: true, // Allow all origins (you can restrict this to your frontend domain)
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Middleware to parse JSON bodies (if you add POST/PUT routes later)
    app.use(express.json());

    // Add logging middleware for debugging
    app.use((req: Request, res: Response, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });

    // Root endpoint for testing
    app.get("/", (req: Request, res: Response) => {
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
    app.get("/api/bot-state", async (req: Request, res: Response) => {
        try {
            const state: BotState = await readState();
            res.json(state);
        } catch (error) {
            console.error("API Error: Failed to read bot state:", error);
            res.status(500).json({ error: "Failed to retrieve bot state" });
        }
    });

    // Basic health check endpoint
    app.get("/api/health", (req: Request, res: Response) => {
        res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version
        });
    });

    // Error handling middleware
    app.use((err: any, req: Request, res: Response, next: any) => {
        console.error('Unhandled error:', err);
        res.status(500).json({ error: 'Internal server error' });
    });

    // 404 handler
    app.use((req: Request, res: Response) => {
        res.status(404).json({ error: 'Route not found' });
    });

    // CRITICAL FIX: Bind to 0.0.0.0, not just localhost
    const server = app.listen(portNumber, '0.0.0.0', () => {
        console.log(`API server listening on port ${portNumber}`);
        console.log(`Bot state available at http://localhost:${portNumber}/api/bot-state`);
        console.log(`Server bound to 0.0.0.0:${portNumber} for external access`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal: string) => {
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