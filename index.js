#!/usr/bin/env node

import AICodeAssistant from './src/app.js';

/**
 * Main entry point untuk AI Code Assistant
 */
async function main() {
    try {
        const app = new AICodeAssistant();
        
        // Setup signal handlers
        app.handleSignals();
        
        // Start application
        await app.start();
        
    } catch (error) {
        console.error('💥 Fatal Error:', error.message);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Promise Rejection:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error.message);
    process.exit(1);
});

// Start the application
main();