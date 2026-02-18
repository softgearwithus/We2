
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY not found in .env');
        return;
    }

    console.log(`Using API Key starting with: ${apiKey.substring(0, 8)}...`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Direct fetch to list models isn't documented clearly in SDK sometimes, but we can try to hit an endpoint or check supported models
        // SDK doesn't have a direct 'listModels' in the main genAI object easily accessible without internal methods
        // But we can try a simple generation with a few known IDs to see which one works

        const models = [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-2.0-flash-001',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-1.5-flash-latest',
        ];

        const results: any[] = [];
        console.log('\nTesting model connectivity:');
        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hi');
                const response = await result.response;
                const text = response.text();
                console.log(`✅ [${modelName}] Success!`);
                results.push({ modelName, status: 'success', response: text.substring(0, 20) });
            } catch (err) {
                console.log(`❌ [${modelName}] Failed: ${err.message}`);
                results.push({ modelName, status: 'failed', error: err.message });
            }
        }

        const fs = require('fs');
        fs.writeFileSync(path.join(__dirname, '../diagnostic_results.json'), JSON.stringify(results, null, 2));
        console.log('\nResults saved to diagnostic_results.json');
    } catch (error) {
        console.error('Fatal error during diagnostic:', error);
    }
}

listModels();
