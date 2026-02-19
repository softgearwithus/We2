import API_BASE_URL from './api-config';

export interface TestCase {
    input: string;
    expected: string;
    isHidden?: boolean;
}

export interface Problem {
    id: string; // slug
    uuid: string; // database UUID
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string; // HTML/Markdown
    examples: Array<{ input: string; output: string; explanation?: string }>;
    constraints: string[];
    starterCode: Record<string, string>;
    codeTemplates?: Record<string, string>;
    languageMeta?: Array<{ lang: string; langSlug: string }>;
    leetcodeUrl?: string | null;
    testCases: TestCase[];
    // New Fields
    acceptanceRate: number;
    status: 'Solved' | 'Attempted' | 'Todo';
    tags: string[];
    companies: string[];
    likes: number;
    dislikes: number;
    hints: string[];
}

export const fetchProblems = async (): Promise<Problem[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/dsa/problems`);
        if (!response.ok) throw new Error('Failed to fetch problems');
        const data = await response.json();
        return data.map((p: any) => ({
            id: p.slug, // Use slug as ID for compatibility with existing frontend routing
            uuid: p.id,
            title: p.title,
            difficulty: p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1),
            description: p.description,
            examples: p.examples,
            constraints: p.constraints,
            starterCode: p.starterCode,
            codeTemplates: p.codeTemplates || null,
            languageMeta: p.languageMeta || null,
            leetcodeUrl: p.leetcodeUrl || null,
            testCases: p.testCases,
            acceptanceRate: p.submissions > 0 ? Math.round((p.accepted / p.submissions) * 100 * 10) / 10 : 0,
            status: 'Todo',
            tags: p.categories || [],
            companies: [],
            likes: p.likes,
            dislikes: p.dislikes,
            hints: p.hints || []
        }));
    } catch (error) {
        console.error('Error fetching problems:', error);
        return problems; // Fallback to mock data
    }
};

export const fetchProblemBySlug = async (slug: string): Promise<Problem | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/dsa/problems/slug/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch problem');
        const p = await response.json();
        return {
            id: p.slug,
            uuid: p.id,
            title: p.title,
            difficulty: p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1),
            description: p.description,
            examples: p.examples,
            constraints: p.constraints,
            starterCode: p.starterCode,
            codeTemplates: p.codeTemplates || null,
            languageMeta: p.languageMeta || null,
            leetcodeUrl: p.leetcodeUrl || null,
            testCases: p.testCases,
            acceptanceRate: p.submissions > 0 ? Math.round((p.accepted / p.submissions) * 100 * 10) / 10 : 0,
            status: 'Todo',
            tags: p.categories || [],
            companies: [],
            likes: p.likes,
            dislikes: p.dislikes,
            hints: p.hints || []
        };
    } catch (error) {
        console.error('Error fetching problem:', error);
        return problems.find(p => p.id === slug) || null;
    }
};

export const problems: Problem[] = [
    {
        id: 'two-sum',
        uuid: 'mock-uuid-two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        description: `
            <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
            <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
            <p>You can return the answer in any order.</p>
        `,
        examples: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
            },
            {
                input: 'nums = [3,2,4], target = 6',
                output: '[1,2]'
            }
        ],
        constraints: [
            '2 <= nums.length <= 10^4',
            '-10^9 <= nums[i] <= 10^9',
            '-10^9 <= target <= 10^9',
            'Only one valid answer exists.'
        ],
        starterCode: {
            javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};`,
            python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        `,
            java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}`
        },
        testCases: [
            { input: '([2,7,11,15], 9)', expected: '[0,1]' },
            { input: '([3,2,4], 6)', expected: '[1,2]' },
            { input: '([3,3], 6)', expected: '[0,1]' },
            { input: '([1,2,3,4,5], 9)', expected: '[3,4]', isHidden: true },
            { input: '([0,4,3,0], 0)', expected: '[0,3]', isHidden: true },
        ],
        acceptanceRate: 48.5,
        status: 'Todo',
        tags: ['Array', 'Hash Table'],
        companies: ['Google', 'Amazon', 'Facebook', 'Microsoft'],
        likes: 45000,
        dislikes: 1200,
        hints: [
            "A really brute force way would be to search for all possible pairs of numbers but that would be slow. Again, it's best to try out brute force solutions for completeness. It is from these brute force solutions that you can come up with optimizations.",
            "So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter. Can we change our array somehow so that this search becomes faster?",
            "The second train of thought is, without changing the array, can we use additional space to somehow simplify the search? Maybe a hash map?"
        ]
    },
    {
        id: 'reverse-string',
        uuid: 'mock-uuid-reverse-string',
        title: 'Reverse String',
        difficulty: 'Easy',
        description: `
            <p>Write a function that reverses a string. The input string is given as an array of characters <code>s</code>.</p>
            <p>You must do this by modifying the input array <strong>in-place</strong> with <code>O(1)</code> extra memory.</p>
        `,
        examples: [
            {
                input: 's = ["h","e","l","l","o"]',
                output: '["o","l","l","e","h"]'
            }
        ],
        constraints: [
            '1 <= s.length <= 10^5',
            's[i] is a printable ascii character.'
        ],
        starterCode: {
            javascript: `/**\n * @param {character[]} s\n * @return {void} Do not return anything, modify s in-place instead.\n */\nvar reverseString = function(s) {\n    \n};`,
            python: `class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        """\n        Do not return anything, modify s in-place instead.\n        """\n        `,
        },
        testCases: [
            { input: '(["h","e","l","l","o"])', expected: '["o","l","l","e","h"]' },
            { input: '(["H","a","n","n","a","h"])', expected: '["h","a","n","n","a","H"]' },
        ],
        acceptanceRate: 75.2,
        status: 'Todo',
        tags: ['Two Pointers', 'String'],
        companies: ['Adobe', 'Cisco', 'Apple'],
        likes: 12000,
        dislikes: 400,
        hints: [
            "Use two pointers. One at the beginning and one at the end.",
            "Swap the characters at the two pointers and move them towards each other."
        ]
    },
    // Adding more mock problems
    {
        id: 'palindrome-number',
        uuid: 'mock-uuid-palindrome-number',
        title: 'Palindrome Number',
        difficulty: 'Easy',
        description: '<p>Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a palindrome, and <code>false</code> otherwise.</p>',
        examples: [{ input: 'x = 121', output: 'true' }, { input: 'x = -121', output: 'false', explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.' }],
        constraints: ['-2^31 <= x <= 2^31 - 1'],
        starterCode: { javascript: 'var isPalindrome = function(x) {\n    \n};' },
        testCases: [],
        acceptanceRate: 52.1,
        status: 'Solved',
        tags: ['Math'],
        companies: ['Google', 'Facebook'],
        likes: 8000,
        dislikes: 100,
        hints: []
    },
    {
        id: 'median-of-two-sorted-arrays',
        uuid: 'mock-uuid-median-of-two-sorted-arrays',
        title: 'Median of Two Sorted Arrays',
        difficulty: 'Hard',
        description: '<p>Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return the median of the two sorted arrays.</p><p>The overall run time complexity should be <code>O(log (m+n))</code>.</p>',
        examples: [{ input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000' }],
        constraints: [],
        starterCode: { javascript: 'var findMedianSortedArrays = function(nums1, nums2) {\n    \n};' },
        testCases: [],
        acceptanceRate: 35.6,
        status: 'Todo',
        tags: ['Array', 'Binary Search', 'Divide and Conquer'],
        companies: ['Google', 'Microsoft', 'Apple', 'Amazon', 'Bloomberg'],
        likes: 22000,
        dislikes: 1500,
        hints: []
    },
    {
        id: 'longest-substring-without-repeating-characters',
        uuid: 'mock-uuid-longest-substring-without-repeating-characters',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        description: '<p>Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.</p>',
        examples: [{ input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' }],
        constraints: [],
        starterCode: { javascript: 'var lengthOfLongestSubstring = function(s) {\n    \n};' },
        testCases: [],
        acceptanceRate: 33.8,
        status: 'Attempted',
        tags: ['Hash Table', 'String', 'Sliding Window'],
        companies: ['Amazon', 'Facebook', 'Bloomberg', 'Yandex', 'Adobe'],
        likes: 31000,
        dislikes: 1300,
        hints: []
    },
    {
        id: 'valid-parentheses',
        uuid: 'mock-uuid-valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        description: '<p>Given a string <code>s</code> containing just the characters <code>\'(\'</code>, <code>\')\'</code>, <code>\'{\'</code>, <code>\'}\'</code>, <code>\'[\'</code> and <code>\']\'</code>, determine if the input string is valid.</p>',
        examples: [{ input: 's = "()"', output: 'true' }],
        constraints: [],
        starterCode: { javascript: 'var isValid = function(s) {\n    \n};' },
        testCases: [],
        acceptanceRate: 40.2,
        status: 'Solved',
        tags: ['Stack', 'String'],
        companies: ['Facebook', 'Amazon', 'Microsoft', 'Bloomberg'],
        likes: 18000,
        dislikes: 900,
        hints: []
    },
    {
        id: 'merge-k-sorted-lists',
        uuid: 'mock-uuid-merge-k-sorted-lists',
        title: 'Merge k Sorted Lists',
        difficulty: 'Hard',
        description: '<p>You are given an array of <code>k</code> linked-lists <code>lists</code>, each linked-list is sorted in ascending order.</p><p><em>Merge all the linked-lists into one sorted linked-list and return it.</em></p>',
        examples: [{ input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }],
        constraints: [],
        starterCode: { javascript: 'var mergeKLists = function(lists) {\n    \n};' },
        testCases: [],
        acceptanceRate: 48.7,
        status: 'Todo',
        tags: ['Linked List', 'Divide and Conquer', 'Heap (Priority Queue)', 'Merge Sort'],
        companies: ['Facebook', 'Amazon', 'Microsoft', 'Google'],
        likes: 16000,
        dislikes: 600,
        hints: []
    },
    {
        id: 'container-with-most-water',
        uuid: 'mock-uuid-container-with-most-water',
        title: 'Container With Most Water',
        difficulty: 'Medium',
        description: '<p>You are given an integer array <code>height</code> of length <code>n</code>. There are <code>n</code> vertical lines drawn such that the two endpoints of the <code>i<sup>th</sup></code> line are <code>(i, 0)</code> and <code>(i, height[i])</code>.</p><p>Find two lines that together with the x-axis form a container, such that the container contains the most water.</p>',
        examples: [{ input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' }],
        constraints: [],
        starterCode: { javascript: 'var maxArea = function(height) {\n    \n};' },
        testCases: [],
        acceptanceRate: 53.9,
        status: 'Attempted',
        tags: ['Array', 'Two Pointers', 'Greedy'],
        companies: ['Amazon', 'Google', 'Adobe', 'Bloomberg'],
        likes: 21000,
        dislikes: 1100,
        hints: []
    }
];
