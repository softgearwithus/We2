#!/usr/bin/env node

const vm = require('vm');
const fs = require('fs');

/**
 * Secure JavaScript Code Executor
 * Runs user code in an isolated VM sandbox with strict limits
 */

// Configuration
const EXECUTION_TIMEOUT = 3000; // 3 seconds
const MAX_OUTPUT_LENGTH = 10000; // 10KB

// Read user code from file
let userCode = '';
try {
    userCode = fs.readFileSync('/app/temp/solution.js', 'utf8');
} catch (error) {
    process.stderr.write('Error reading solution file\n');
    process.exit(1);
}

// Read test input from stdin
let testInput = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    testInput += chunk;
});

process.stdin.on('end', () => {
    executeCode(userCode, testInput.trim());
});

function executeCode(code, input) {
    // Output buffer
    let output = '';
    let errorOutput = '';

    // Create secure sandbox
    const sandbox = {
        // Limited console
        console: {
            log: (...args) => {
                const line = args.map(arg => String(arg)).join(' ') + '\n';
                if (output.length + line.length < MAX_OUTPUT_LENGTH) {
                    output += line;
                }
            },
            error: (...args) => {
                const line = args.map(arg => String(arg)).join(' ') + '\n';
                errorOutput += line;
            },
        },

        // Provide input
        input: input,

        // Safe JSON
        JSON: JSON,

        // Blocked globals
        require: undefined,
        process: undefined,
        global: undefined,
        Buffer: undefined,
    };

    try {
        // Execute with timeout
        vm.runInNewContext(code, sandbox, {
            timeout: EXECUTION_TIMEOUT,
            breakOnSigint: true,
            displayErrors: true,
        });

        // Write output to stdout
        process.stdout.write(output);

        if (errorOutput) {
            process.stderr.write(errorOutput);
        }

        process.exit(0);

    } catch (error) {
        // Handle execution errors
        if (error.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
            process.stderr.write('Time Limit Exceeded\n');
            process.exit(124); // Timeout exit code
        } else if (error.code === 'ERR_SCRIPT_EXECUTION_INTERRUPTED') {
            process.stderr.write('Execution Interrupted\n');
            process.exit(130); // Interrupted exit code
        } else {
            process.stderr.write(`Runtime Error: ${error.message}\n`);
            process.exit(1);
        }
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    process.stderr.write(`Uncaught Exception: ${error.message}\n`);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    process.stderr.write(`Unhandled Rejection: ${reason}\n`);
    process.exit(1);
});
