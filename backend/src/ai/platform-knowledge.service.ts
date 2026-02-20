import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { BASE_PLATFORM_KNOWLEDGE } from './platform-knowledge';

@Injectable()
export class PlatformKnowledgeService {
    private readonly logger = new Logger(PlatformKnowledgeService.name);
    private cached: string | null = null;
    private lastLoaded = 0;
    private readonly refreshMs = parseInt(process.env.AI_KNOWLEDGE_REFRESH_MS || '300000', 10);
    private readonly maxChars = parseInt(process.env.AI_KNOWLEDGE_MAX_CHARS || '14000', 10);
    private readonly perFileLines = parseInt(process.env.AI_KNOWLEDGE_MAX_LINES || '140', 10);

    async getKnowledge() {
        const now = Date.now();
        if (this.cached && now - this.lastLoaded < this.refreshMs) {
            return this.cached;
        }

        const combined = this.buildKnowledge();
        this.cached = combined;
        this.lastLoaded = now;
        return combined;
    }

    private buildKnowledge() {
        const docs = this.loadDocs();
        const combined = [
            BASE_PLATFORM_KNOWLEDGE.trim(),
            docs ? `\n\n## Internal Platform Docs\n${docs}` : '',
        ].join('\n');

        return combined.length > this.maxChars
            ? combined.slice(0, this.maxChars) + '\n...'
            : combined;
    }

    private loadDocs() {
        const relativeFiles = [
            'README.md',
            '../frontend/README.md',
            '../backend/README.md',
            '../college/college_platform_workflow.md',
            '../college/college_platform_features_expansion.md',
            '../college/college_platform_ui_components.md',
            '../college/college_platform_frontend_system_design.md',
            '../college/college_platform_tier2_tier3_ux_strategy.md',
            '../Prep0/prep0_frontend_prompt.md',
            '../Prep0/prep0_backend_prompt.md',
            '../Prep0/prep0dash.md',
        ];

        const roots = [process.cwd(), path.resolve(process.cwd(), '..')];
        const collected: string[] = [];

        for (const rel of relativeFiles) {
            const filePath = this.resolvePath(roots, rel);
            if (!filePath) continue;
            try {
                const raw = fs.readFileSync(filePath, 'utf8');
                const snippet = raw
                    .split('\n')
                    .slice(0, this.perFileLines)
                    .join('\n')
                    .trim();
                if (snippet) {
                    collected.push(`\n### ${path.basename(filePath)}\n${snippet}`);
                }
            } catch (error) {
                this.logger.warn(`Failed to read ${filePath}`);
            }
        }

        return collected.join('\n');
    }

    private resolvePath(roots: string[], relativePath: string) {
        for (const root of roots) {
            const candidate = path.resolve(root, relativePath);
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }
        return null;
    }
}
