
import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private readonly logger = new Logger(GeminiService.name);
    private genAI: GoogleGenerativeAI | null = null;
    private model: any;
    private defaultModelName: string | null = null;

    constructor() {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                this.logger.warn('GEMINI_API_KEY is not defined. Using fallback mode.');
            } else {
                this.genAI = new GoogleGenerativeAI(apiKey);
                const modelName = (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL !== 'gemini-pro')
                    ? process.env.GEMINI_MODEL
                    : 'gemini-2.5-flash';
                this.defaultModelName = modelName;
                this.model = this.genAI.getGenerativeModel({ model: modelName });
            }
        } catch (error) {
            this.logger.error('Failed to initialize Gemini AI', error);
        }
    }

    async generateDrillContent(topic: string, userContext?: any) {
        if (!this.genAI) {
            this.logger.warn('Gemini model not initialized. Cannot generate drill content.');
            throw new Error('Gemini API not configured');
        }
        try {
            const prompt = `
            Generate 5 unique, challenging, and relevant audio drill scenarios for a candidate preparing for: "${topic}".
            
            Context: ${JSON.stringify(userContext || {})}
            
            For each scenario, provide:
            1. A short title.
            2. A difficult situation or question they must address vocally.
            3. Key points they should cover in their response.
            
            Format the response as a JSON array of objects with keys: 'id', 'title', 'scenario', 'keyPoints'.
            Ensure the content is professional and suitable for interview preparation.
            `;

            const { text } = await this.generateContentWithFallback([prompt]);
            const parsed = this.parseJSON(text);
            if (!Array.isArray(parsed)) {
                throw new Error('Invalid drill content response: expected JSON array');
            }
            return parsed;
        } catch (error) {
            this.logger.error('Error generating drill content', error);
            throw error;
        }
    }

    async generateCommunicationDrill(topic?: string) {
        if (!this.genAI) {
            this.logger.warn('Gemini model not initialized. Cannot generate communication drill.');
            throw new Error('Gemini API not configured');
        }

        try {
            // Enhanced Topic Variety: If no topic is provided, pick a random domain to force variety
            let generationTopic = topic;
            if (!generationTopic) {
                const domains = [
                    "Quantum Computing & Cybersecurity", "Sustainable Urban Architecture", "Behavioral Economics in Marketing",
                    "Space Exploration Ethics", "Regenerative Medicine & Bio-tech", "Oceanic Preservation Technology",
                    "Agile Leadership in Remote Teams", "The Future of Decentralized Finance (DeFi)", "Cultural Intelligence in Global Business",
                    "Renewable Energy Infrastructure", "Psychology of Consumer Behavior", "Artificial Intelligence in Healthcare Diagnosis",
                    "Supply Chain Resilience & Geopolitics", "The Impact of 5G on Smart Cities", "Philosophy of Workplace Inclusivity"
                ];
                generationTopic = domains[Math.floor(Math.random() * domains.length)];
            }

            const prompt = `
            Generate a unique, comprehensive, and thematically cohesive 3-part communication drill for an interview candidate.
            
            Theme: ${generationTopic}

            CRITICAL: Ensure the content is fresh and distinct from common templates. 
            Do NOT use generic text about "Remote Work" or "AI Ethics" unless specifically requested.
            Use professional, sophisticated vocabulary.

            The output must be a single JSON object with the following structure:
            {
                "theme": "The specific chosen theme",
                "reading": [
                    { "level": "Easy", "text": "A paragraph (approx 80-100 words) introducing the theme." },
                    { "level": "Medium", "text": "A paragraph (approx 100-120 words) discussing challenges or nuances of the theme." },
                    { "level": "Hard", "text": "A paragraph (approx 120-150 words) analyzing complex implications or future trends of the theme." }
                ],
                "listening": [
                    "Sentence 1 (Short, punchy fact about the theme)",
                    "Sentence 2 (Medium length, opinion or quote)",
                    "Sentence 3 (Longer, complex sentence summarizing a key point)"
                ],
                "extempore": {
                    "topic": "Specific question or prompt related to the theme for a 60-second speech",
                    "keyPoints": ["Point 1", "Point 2", "Point 3"]
                }
            }

            Return ONLY the valid JSON.
            `;

            const { text, modelName } = await this.generateContentWithFallback([prompt]);
            const parsed = this.parseJSON(text);
            return { ...parsed, metadata: { source: 'Gemini AI', model: modelName } };
        } catch (error) {
            this.logger.error('All Gemini models failed', error);
            throw error;
        }
    }

    async analyzeAudio(audioBase64: string, context: string): Promise<any> {
        try {
            let prompt = '';

            prompt = `
            Analyze this audio response for an interview communication drill.
            Context/Prompt: "${context}"
            
            CRITICAL INSTRUCTIONS (HARD MARKING SCHEME):
            1. ACT AS A TOUGH INTERVIEWER: Apply a very strict marking scheme. A score of 90+ should be nearly impossible for anyone but a professional orator. 
            2. SILENCE/NOISE/EMPTY AUDIO (CRITICAL): If you cannot hear clear, distinct, and audible human speech, OR if it's just static/background noise, YOU MUST return "overallScore": 0, set all metrics to 0, return an empty string for "transcript", and explicitly state "No audible speech detected" in "feedback". DO NOT HALLUCINATE OR INVENT A TRANSCRIPT just because you have the Prompt Context.
            3. CONTENT RELEVANCE (STRICT ENFORCEMENT - ZERO TOLERANCE FOR OFF-TOPIC):
               - If the spoken content is COMPLETELY IRRELEVANT to the given Context/Prompt, YOU MUST return "overallScore": 0, set all metrics to 0, and explicitly state "The response was completely off-topic and irrelevant to the prompt" in your "feedback".
               - "Reading Task": Must be 100% VERBATIM to the Context. If they speak about something else entirely, score 0. -5 points for every word changed.
               - "Listening Task": Must be EXACT. If they speak about something else entirely, score 0. -10 points for every minor alteration.
               - "Extempore Task": Must heavily focus on the specific topic provided. If they drift, speak generic filler, or ignore the actual prompt, score "overallScore" 0.
               - "Technical/Interview Task": Must answer the specific question asked based on the Context. If they give a generic answer or discuss a different topic, score "overallScore" 0.
            4. FLUENCY & FILLERS: Deduct 5 points for every "um", "uh", or significant hesitation. 
            5. TONE & CLARITY: Any mumbling or low confidence should result in metrics below 40.
            6. TRANSCRIPT ACCURACY: The transcript MUST BE EXACTLY WHAT WAS SAID. If they said nothing, the transcript MUST BE EMPTY.


            Provide a detailed "World Class" assessment based on the following metrics (scale 0-100 where applicable):
            1. Fluency (Strict: penalize every "uh/um")
            2. Pronunciation (Strict: penalize every slur/mumble)
            3. Confidence (Strict: tone stability)
            4. Speech Speed (Strict: must be professional pace)
            5. Filler Words (Count every instance)
            6. Content Relevance (Strict adherence)
            7. Grammar & Syntax (Correctness of phrasing)
            8. Vocabulary Usage (Sophistication/Appropriateness)
            
            Also provide:
            - A verbatim transcript.
            - "Communication Persona": A 3-4 word creative label for the speaker (e.g., "The Hesitant Expert", "The Precise Professional").
            - "Metric Reasoning": A short explanation for WHY each metric got its specific score.
            - Top 3 Specific Strengths (Be very critical, only if they truly excel).
            - Top 3 Specific Improvements (Be detailed and constructive).
            - "Actionable Coaching": 3-5 specific exercises to improve.
            - An Overall Score (0-100) (Calculated based on the strict deductions above).

            Return ONLY valid JSON with keys: 
            {
                "metrics": { "fluency": number, "pronunciation": number, "confidence": number, "speechSpeed": number, "fillerWords": number, "contentRelevance": number, "grammar": number, "vocabulary": number },
                "communicationPersona": string,
                "metricReasoning": { "fluency": string, "pronunciation": string, "confidence": string, "relevance": string, "grammar": string },
                "transcript": string,
                "strengths": string[],
                "improvements": string[],
                "actionableCoaching": string[],
                "overallScore": number,
                "feedback": string
            }
            `;

            // Note: For real audio processing, we'd use the inlineData part of the Gemini API.
            // Assuming audioBase64 is the raw data.
            const part = {
                inlineData: {
                    mimeType: "audio/webm", // Adjust based on client recording format
                    data: audioBase64
                }
            };

            const { text } = await this.generateContentWithFallback([prompt, part]);
            const parsed = this.parseJSON(text);
            if (!parsed || typeof parsed.overallScore !== 'number') {
                throw new Error('Invalid analysis response: missing overallScore');
            }
            return parsed;

        } catch (error) {
            this.logger.error('Error analyzing audio', error);
            throw error;
        }
    }

    private parseJSON(text: string): any {
        if (!text) {
            throw new Error('Empty response from AI model');
        }
        try {
            const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();

            if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
                return JSON.parse(cleaned);
            }

            const firstObject = cleaned.indexOf('{');
            const firstArray = cleaned.indexOf('[');
            const start = [firstObject, firstArray].filter((i) => i >= 0).sort((a, b) => a - b)[0];
            if (start === undefined) {
                throw new Error(`No JSON object found in response: ${cleaned.substring(0, 100)}...`);
            }

            const isArray = cleaned[start] === '[';
            const end = isArray ? cleaned.lastIndexOf(']') : cleaned.lastIndexOf('}');
            if (end === -1) {
                throw new Error(`No JSON object found in response: ${cleaned.substring(0, 100)}...`);
            }

            const jsonStr = cleaned.substring(start, end + 1);
            return JSON.parse(jsonStr);
        } catch (e) {
            this.logger.error('Failed to parse Gemini JSON response', e);
            this.logger.error('Raw text received:', text);
            throw new Error(`Invalid AI response format: ${e.message}`);
        }
    }

    private getModelCandidates(): string[] {
        const candidates = [
            process.env.GEMINI_MODEL,
            this.defaultModelName,
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-flash',
        ]
            .filter((m): m is string => !!m && m !== 'gemini-pro');

        return Array.from(new Set(candidates));
    }

    private isQuotaError(error: any): boolean {
        const message = (error?.message || '').toString();
        return message.includes('429') || message.toLowerCase().includes('quota');
    }

    private async generateContentWithFallback(parts: any[]): Promise<{ text: string; modelName: string }> {
        if (!this.genAI) {
            throw new Error('Gemini API not configured');
        }

        const modelsToTry = this.getModelCandidates();
        if (modelsToTry.length === 0) {
            throw new Error('No Gemini models configured');
        }

        let lastError: any;
        for (const modelName of modelsToTry) {
            try {
                this.logger.log(`Attempting to generate with model: ${modelName}`);
                const model = this.genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(parts);
                const response = await result.response;
                const text = response.text();
                if (!text) {
                    throw new Error('Empty response from Gemini');
                }
                this.logger.log(`Successfully generated content using: ${modelName}`);
                return { text, modelName };
            } catch (error) {
                lastError = error;
                this.logger.warn(`Model ${modelName} failed: ${error.message}`);
                if (this.isQuotaError(error)) {
                    this.logger.error(`Quota exceeded for ${modelName}. Stopping fallback attempts.`);
                    break;
                }
            }
        }

        throw lastError || new Error('Gemini generation failed');
    }
}
