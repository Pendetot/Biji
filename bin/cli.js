#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import AICodeAssistant from '../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * CLI entry point untuk AI Code Assistant
 */
async function cli() {
    try {
        const app = new AICodeAssistant();
        
        // Setup signal handlers
        app.handleSignals();
        
        // Start application
        await app.start();
        
    } catch (error) {
        console.error('💥 CLI Error:', error.message);
        process.exit(1);
    }
}

// Start CLI
cli();