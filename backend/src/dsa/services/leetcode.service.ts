import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class LeetCodeService {
    async fetchEditorData(titleSlug: string) {
        const response = await fetch('https://leetcode.com/graphql/', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                operationName: 'questionEditorData',
                variables: { titleSlug },
                query: 'query questionEditorData($titleSlug: String!) { question(titleSlug: $titleSlug) { codeSnippets { lang langSlug code } } }',
            }),
        });

        if (!response.ok) {
            throw new InternalServerErrorException('Failed to fetch LeetCode editor data');
        }

        const data = await response.json();
        const snippets = data?.data?.question?.codeSnippets || [];

        const languageMeta = snippets.map((item: any) => ({
            lang: item.lang,
            langSlug: item.langSlug,
        }));
        const templates = snippets.reduce((acc: Record<string, string>, item: any) => {
            acc[item.langSlug] = item.code;
            return acc;
        }, {});

        return { languageMeta, templates };
    }

    async fetchQuestionContent(titleSlug: string) {
        const response = await fetch('https://leetcode.com/graphql/', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                operationName: 'questionContent',
                variables: { titleSlug },
                query: 'query questionContent($titleSlug: String!) { question(titleSlug: $titleSlug) { content } }',
            }),
        });

        if (!response.ok) {
            throw new InternalServerErrorException('Failed to fetch LeetCode question content');
        }

        const data = await response.json();
        const content = data?.data?.question?.content || '';

        return {
            content,
            constraints: this.extractConstraints(content),
        };
    }

    private extractConstraints(content: string): string[] {
        if (!content) return [];

        const strongMatch = content.match(/<strong>\s*Constraints\s*:?\s*<\/strong>([\s\S]*?)(<strong>|$)/i);
        const strongSection = strongMatch?.[1] || '';
        const listMatch = strongSection.match(/<ul>([\s\S]*?)<\/ul>/i);
        const listSection = listMatch?.[1] || strongSection;

        if (listSection) {
            return this.extractListItems(listSection);
        }

        const fallbackMatch = content.match(/Constraints\s*:?\s*<\/p>\s*<ul>([\s\S]*?)<\/ul>/i);
        if (fallbackMatch?.[1]) {
            return this.extractListItems(fallbackMatch[1]);
        }

        return [];
    }

    private extractListItems(section: string): string[] {
        return Array.from(section.matchAll(/<li>([\s\S]*?)<\/li>/gi))
            .map((match) => this.cleanText(match[1]))
            .filter((value) => value.length > 0);
    }

    private cleanText(value: string): string {
        const withoutTags = value.replace(/<[^>]*>/g, ' ');
        return this.decodeEntities(withoutTags).replace(/\s+/g, ' ').trim();
    }

    private decodeEntities(value: string): string {
        return value
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'");
    }
}
