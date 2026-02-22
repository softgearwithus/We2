import { DataSource } from 'typeorm';
import { CourseContent } from './course-content/entities/course-content.entity';
import { DsaProblem, Difficulty, ProblemCategory } from './dsa/entities/dsa-problem.entity';
import { Submission } from './dsa/entities/submission.entity';
import { Team } from './teams/entities/team.entity';
import { User } from './users/user.entity';
import { Simulation } from './simulations/entities/simulation.entity';
import { Task } from './tasks/entities/task.entity';
import { TeamMember } from './teams/entities/team-member.entity';
import { Performance } from './performance/entities/performance.entity';
import { Achievement } from './achievements/entities/achievement.entity';
import { Certification } from './certifications/entities/certification.entity';
import { Project } from './projects/entities/project.entity';
import { InterviewSession } from './interviews/entities/interview-session.entity';
import { Interview } from './interview/entities/interview.entity';
import { resolveDbConfig } from './common/db-config';

require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'postgres',
    ...resolveDbConfig(),
    entities: [
        CourseContent,
        DsaProblem,
        Submission,
        User,
        Team,
        TeamMember,
        Simulation,
        Task,
        Performance,
        Achievement,
        Certification,
        Project,
        InterviewSession,
        Interview
    ],
    synchronize: true,
});

async function seed() {
    try {
        console.log("Connecting to DB...");
        await AppDataSource.initialize();
        console.log("Connected!");

        const contentRepo = AppDataSource.getRepository(CourseContent);
        const problemRepo = AppDataSource.getRepository(DsaProblem);

        // 1. Refined Course Content (Theory)
        const contents = [
            {
                topicId: 'basic-maths-for-coding',
                title: 'Mastering Basic Mathematics for Programming',
                content: `# Introduction to Mathematical Logic in Coding
Linear logic and mathematical properties are essential for optimizing algorithms. This guide covers the most fundamental math concepts you'll encounter in technical interviews.

## 1. Digit Extraction & Manipulation
The most common way to process a number is by extracting its digits. This is done using the modulo operator (%) and integer division (/).

### Logic:
- **Last Digit**: \`n % 10\`
- **Remove Last Digit**: \`n / 10\`

### Example: Palindrome Number
A number is a palindrome if it reads the same backwards as forwards (e.g., 121).
**Approach**:
1. Store the original number.
2. Reverse the number by extracting digits.
3. Compare the reversed number with the original.

## 2. GCD and HCF (Euclidean Algorithm)
The Greatest Common Divisor (GCD) is the largest positive integer that divides each of the integers.
**Euclidean Algorithm**:
\`gcd(a, b) = gcd(b, a % b)\` until \`a % b == 0\`.

## 3. Prime Number Check
A number is prime if it is divisible only by 1 and itself.
**Optimization**: Instead of checking up to \`n\`, check up to \`sqrt(n)\`. If a number has a divisor larger than its square root, it must also have one smaller than its square root.`
            },
            {
                topicId: 'basic-recursion',
                title: 'Recursion Fundamentals: Thinking in Fractions',
                content: `# Understanding Recursion
Recursion occurs when a function calls itself to solve a smaller version of the same problem. Think of it as a "leap of faith."

## Key Pillars of Recursion:
1. **Base Case**: The stopping condition that prevents infinite loops.
2. **Recursive Step**: Calling the function with a reduced input.

## Memory Management: The Call Stack
Every recursive call is pushed onto the **Stack**. If the recursion is too deep without hitting a base case, it leads to a **Stack Overflow**.

### Common Patterns:
- **Parameterized Recursion**: Passing values in the function arguments.
- **Functional Recursion**: Returning values from the recursive calls.`
            }
        ];

        for (const c of contents) {
            await contentRepo.upsert(c, ['topicId']);
            console.log(`Seeded/Updated content: ${c.topicId}`);
        }

        // 2. Refined DSA Problems
        const problems = [
            {
                title: 'Reverse a Number',
                slug: 'reverse-number',
                difficulty: Difficulty.EASY,
                description: 'Given an integer `n`, return the integer with its digits reversed. If reversing `n` causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.',
                examples: [
                    { input: 'n = 123', output: '321' },
                    { input: 'n = -123', output: '-321' }
                ],
                constraints: ['-2^31 <= n <= 2^31 - 1'],
                starterCode: {
                    cpp: 'int reverse(int n) {\n    \n}',
                    java: 'public int reverse(int n) {\n    \n}',
                    python: 'def reverse(self, n: int) -> int:\n    '
                },
                testCases: [
                    { input: '123', expected: '321' },
                    { input: '-123', expected: '-321' },
                    { input: '120', expected: '21' }
                ],
                categories: [ProblemCategory.ARRAY]
            },
            {
                title: 'Check Palindrome Number',
                slug: 'check-palindrome-number',
                difficulty: Difficulty.EASY,
                description: 'Determine whether an integer is a palindrome. An integer is a palindrome when it reads the same backward as forward.',
                examples: [
                    { input: 'n = 121', output: 'true' },
                    { input: 'n = -121', output: 'false', explanation: 'From left to right, it is -121. From right to left, it becomes 121-. Therefore it is not a palindrome.' }
                ],
                constraints: ['-2^31 <= n <= 2^31 - 1'],
                starterCode: {
                    cpp: 'bool isPalindrome(int n) {\n    \n}',
                    java: 'public boolean isPalindrome(int n) {\n    \n}',
                    python: 'def isPalindrome(self, n: int) -> bool:\n    '
                },
                testCases: [
                    { input: '121', expected: 'true' },
                    { input: '-121', expected: 'false' },
                    { input: '10', expected: 'false' }
                ],
                categories: [ProblemCategory.ARRAY]
            }
        ];

        for (const p of problems) {
            const existing = await problemRepo.findOne({ where: { slug: p.slug } });
            if (existing) {
                Object.assign(existing, p);
                await problemRepo.save(existing);
            } else {
                await problemRepo.save(problemRepo.create(p));
            }
            console.log(`Seeded/Updated problem: ${p.slug}`);
        }

        console.log("Seeding complete!");

    } catch (error) {
        console.error("ERROR during seeding:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
