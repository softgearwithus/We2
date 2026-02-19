import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyDHoRRcSNaFiFYgg_7O3ccd7k9_nW98ZtA";

async function run() {
    try {
        console.log("Fetching available models via REST API...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log("Available Models:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}
run();
