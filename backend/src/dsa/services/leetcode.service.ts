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
}
