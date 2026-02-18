
import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private readonly logger = new Logger(GeminiService.name);
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                this.logger.warn('GEMINI_API_KEY is not defined. Using fallback mode.');
            } else {
                this.genAI = new GoogleGenerativeAI(apiKey);
                const modelName = (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL !== 'gemini-pro')
                    ? process.env.GEMINI_MODEL
                    : 'gemini-1.5-flash';
                this.model = this.genAI.getGenerativeModel({ model: modelName });
            }
        } catch (error) {
            this.logger.error('Failed to initialize Gemini AI', error);
        }
    }

    async generateDrillContent(topic: string, userContext?: any) {
        if (!this.model) {
            this.logger.warn('Gemini model not initialized. Returning mock drill content.');
            return [];
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

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseJSON(text);
        } catch (error) {
            this.logger.error('Error generating drill content', error);
            throw error;
        }
    }

    async generateCommunicationDrill(topic?: string) {
        // If model is not initialized (missing key), go straight to fallback
        if (!this.model) {
            this.logger.warn('Gemini model not initialized. Skipping API call and using fallback.');
            throw new Error('Gemini model not initialized');
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

            // Robust Model Selection: Prioritize verified models from diagnostics
            const modelsToTry = [
                process.env.GEMINI_MODEL,
                'gemini-2.5-flash',
                'gemini-2.0-flash',
            ].filter(m => m && m !== 'gemini-pro') as string[];

            let lastError;
            let successResult;

            for (const modelName of modelsToTry) {
                try {
                    this.logger.log(`Attempting to generate with model: ${modelName}`);
                    const model = this.genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();

                    const parsed = this.parseJSON(text);
                    successResult = { ...parsed, metadata: { source: 'Gemini AI', model: modelName } };
                    this.logger.log(`Successfully generated content using: ${modelName}`);
                    break;
                } catch (error) {
                    this.logger.warn(`Model ${modelName} failed: ${error.message}`);
                    lastError = error;

                    // If it's a quota error (429), don't bother trying other models as they likely share quota
                    if (error.message.includes('429') || error.message.includes('Quota exceeded')) {
                        this.logger.error(`Quota exceeded for ${modelName}. Stopping fallback attempts.`);
                        break;
                    }
                }
            }

            if (successResult) {
                return successResult;
            }

            // If all models fail, throw the last error to trigger general fallback
            throw lastError;
        } catch (error) {
            this.logger.error('All Gemini models failed', error);
            // Fallback content to unblock user if AI fails
            this.logger.warn('Returning fallback drill content due to error.');
            return {
                metadata: { source: 'Fallback (Offline)', model: 'None' },
                theme: topic || "Effective Communication in Crisis",
                reading: [
                    { level: "Easy", text: "Communication during a crisis is about clarity and speed. Leaders must convey information accurately to prevent panic. It is essential to be transparent about what is known and what is unknown." },
                    { level: "Medium", text: "In high-pressure situations, non-verbal cues become as important as verbal ones. A calm demeanor can reassure a team more effectively than words alone. However, silence can be misinterpreted as negligence, so consistent updates are vital." },
                    { level: "Hard", text: "The complexity of crisis communication lies in balancing transparency with containment. Over-sharing can lead to hysteria, while withholding information breeds distrust. Strategic ambiguity is sometimes employed, but it carries significant ethical risks in a digital age where information spreads instantly." }
                ],
                listening: [
                    "Transparency builds trust even when the news is bad.",
                    "Active listening is the most underrated skill in conflict resolution.",
                    "Your body language speaks louder than your words during a negotiation."
                ],
                extempore: {
                    "topic": "Is remote work killing team culture?",
                    "keyPoints": ["Impact on organic collaboration", "Role of digital tools", "Mental health implications"]
                }
            };
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
            2. SILENCE/NOISE: If the audio is silent, contains only noise, or has no discernible speech, return "overallScore": 0 and explicitly state this in "feedback".
            3. CONTENT RELEVANCE (ZERO TOLERANCE):
               - "Reading Task": Must be 100% VERBATIM. -5 points for every single word changed, missed, or added.
               - "Listening Task": Must be EXACT. -10 points for every minor alteration.
               - "Extempore Task": Must be logically sound and on-topic. If they drift or speak generic filler, score "Overall Score" below 15.
            4. FLUENCY & FILLERS: Deduct 5 points for every "um", "uh", or significant hesitation. 
            5. TONE & CLARITY: Any mumbling or low confidence should result in metrics below 40.
            6. Verbatim transcript MUST be 100% accurate to what was actually said.

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

            const result = await this.model.generateContent([prompt, part]);
            const response = await result.response;
            const text = response.text();

            return this.parseJSON(text);

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
            // Find the first '{' and last '}'
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');

            if (start === -1 || end === -1) {
                throw new Error(`No JSON object found in response: ${text.substring(0, 100)}...`);
            }

            const jsonStr = text.substring(start, end + 1);
            return JSON.parse(jsonStr);
        } catch (e) {
            this.logger.error('Failed to parse Gemini JSON response', e);
            this.logger.error('Raw text received:', text);
            throw new Error(`Invalid AI response format: ${e.message}`);
        }
    }
}
