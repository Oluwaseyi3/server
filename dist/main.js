"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txCron = void 0;
const raydiumcpm_1 = require("./services/jobs/raydiumcpm");
const cron_1 = require("cron");
const api_1 = require("./api");
exports.txCron = new cron_1.CronJob('0 07 * * * *', // Runs at the 0th second of the 0th minute of every hour
async function () {
    const timestamp = () => `[${new Date().toISOString()}]`;
    console.log(`${timestamp()} Hourly Meteora Bot Cron Job triggered.`);
    try {
        await (0, raydiumcpm_1.runBotMeteora)(); // This now handles scheduling its own withdrawal
    }
    catch (error) {
        console.error(`${timestamp()} Error in hourly Meteora Bot Cron Job execution:`, error);
        // Errors from runBotMeteora (like token/pool creation failure) are caught here.
        // Errors from the setTimeout's withdrawLiquidityFromMeteora are caught within the setTimeout callback.
    }
}, null, // onComplete
true, // Start job automatically when CronJob is instantiated
"UTC" // Or your preferred timezone
);
async function startApp() {
    // Use PORT environment variable or fallback to 10000 (Render's default)
    const port = process.env.PORT || 10000;
    console.log("Initializing application...");
    console.log(`Using port: ${port}`);
    // 1. Setup API Server
    try {
        (0, api_1.setupApi)(port); // This will start listening on 0.0.0.0:port
    }
    catch (err) {
        console.error("Failed to setup API server:", err);
        process.exit(1);
    }
    // 2. Start Cron Job
    if (!exports.txCron.running) {
        exports.txCron.start();
        console.log(`Cron job started. Scheduled to run at the beginning of every hour (UTC).`);
    }
    console.log("Application initialized and running.");
}
// --- Global Error Handling for Uncaught Exceptions/Rejections ---
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Application specific logging, throwing an error, or other logic here
    // It's often recommended to gracefully shut down the process after an uncaught exception
    process.exit(1);
});
// --- RUN THE APP ---
startApp().catch(err => {
    console.error("Critical error during application startup:", err);
    process.exit(1);
});
