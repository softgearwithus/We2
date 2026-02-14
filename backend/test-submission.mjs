// Test script to verify end-to-end code execution
// Run with: node test-submission.mjs

const BASE_URL = 'http://localhost:3001';

// Helper to make HTTP requests
async function request(method, path, body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();
    return { status: response.status, data };
}

async function testE2E() {
    console.log('🧪 Starting End-to-End Submission Test\n');

    // Step 1: Register a test user
    console.log('1️⃣ Registering test user...');
    const registerResult = await request('POST', '/auth/register', {
        email: 'test-coder@example.com',
        password: 'TestPass123!',
    });

    if (registerResult.status !== 201 && registerResult.status !== 409) {
        console.error('❌ Registration failed:', registerResult);
        return;
    }
    console.log('✅ User ready\n');

    // Step 2: Login to get JWT token
    console.log('2️⃣ Logging in...');
    const loginResult = await request('POST', '/auth/login', {
        email: 'test-coder@example.com',
        password: 'TestPass123!',
    });

    if (loginResult.status !== 200) {
        console.error('❌ Login failed:', loginResult);
        return;
    }

    const token = loginResult.data.access_token;
    console.log('✅ Logged in successfully\n');

    // Step 3: Create a test problem
    console.log('3️⃣ Creating test problem...');
    const problemData = {
        title: 'Sum Two Numbers',
        slug: 'sum-two-numbers',
        difficulty: 'easy',
        description: 'Write a function that returns the sum of two numbers.',
        examples: [
            {
                input: 'a = 2, b = 3',
                output: '5',
                explanation: '2 + 3 = 5',
            },
        ],
        constraints: ['Numbers can be any integer'],
        starterCode: {
            javascript: 'var sum = function(a, b) {\n    // Your code here\n    return 0;\n};',
        },
        testCases: [
            {
                input: '(2, 3)',
                expected: '5',
                isHidden: false,
            },
            {
                input: '(10, 20)',
                expected: '30',
                isHidden: false,
            },
            {
                input: '(-5, 5)',
                expected: '0',
                isHidden: true,
            },
        ],
        categories: ['math', 'basic'],
        hints: ['Think about the + operator'],
        solution: null,
        likes: 0,
        dislikes: 0,
        submissions: 0,
        accepted: 0,
        isActive: true,
    };

    const problemResult = await request('POST', '/dsa/problems', problemData, token);

    if (problemResult.status !== 201) {
        console.error('❌ Problem creation failed:', problemResult);
        return;
    }

    const problemId = problemResult.data.id;
    console.log(`✅ Problem created with ID: ${problemId}\n`);

    // Step 4: Submit correct solution
    console.log('4️⃣ Submitting CORRECT solution...');
    const correctSubmission = {
        problemId: problemId,
        language: 'javascript',
        code: 'var sum = function(a, b) {\n    return a + b;\n};',
    };

    const submitResult = await request('POST', '/dsa/submissions', correctSubmission, token);

    if (submitResult.status !== 201) {
        console.error('❌ Submission failed:', submitResult);
        return;
    }

    const submissionId = submitResult.data.submissionId;
    console.log('✅ Submission queued');
    console.log(`   Submission ID: ${submissionId}`);
    console.log(`   Queue Position: ${submitResult.data.queuePosition}`);
    console.log(`   Estimated Wait: ${submitResult.data.estimatedWaitTime}s\n`);

    // Step 5: Poll for results
    console.log('5️⃣ Waiting for execution...');
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const statusResult = await request('GET', `/dsa/submissions/${submissionId}`, null, token);
        attempts++;

        if (statusResult.status !== 200) {
            console.error('❌ Status check failed:', statusResult);
            return;
        }

        const submission = statusResult.data;
        console.log(`   [${attempts}] Status: ${submission.status}...`);

        if (submission.status !== 'queued' && submission.status !== 'running') {
            console.log('\n📊 EXECUTION COMPLETE!\n');
            console.log('═══════════════════════════════════════');
            console.log(`Status:        ${submission.status}`);
            console.log(`Tests Passed:  ${submission.passedTests}/${submission.totalTests}`);
            console.log(`Runtime:       ${submission.runtime || 'N/A'}`);
            console.log(`Memory:        ${submission.memory || 'N/A'}`);

            if (submission.status === 'accepted') {
                console.log('\n🎉 SUCCESS! All tests passed!');
            } else {
                console.log(`\n❌ Failed: ${submission.status}`);
                if (submission.failedTestCase) {
                    console.log('\nFailed Test Case:');
                    console.log(`  Input:    ${submission.failedTestCase.input}`);
                    console.log(`  Expected: ${submission.failedTestCase.expected}`);
                    console.log(`  Actual:   ${submission.failedTestCase.actual}`);
                }
            }
            console.log('═══════════════════════════════════════\n');

            // Step 6: Submit WRONG solution
            console.log('6️⃣ Testing WRONG solution...');
            const wrongSubmission = {
                problemId: problemId,
                language: 'javascript',
                code: 'var sum = function(a, b) {\n    return 0; // Always wrong\n};',
            };

            const wrongResult = await request('POST', '/dsa/submissions', wrongSubmission, token);
            const wrongId = wrongResult.data.submissionId;

            // Wait for wrong submission
            await new Promise(resolve => setTimeout(resolve, 3000));

            const wrongStatus = await request('GET', `/dsa/submissions/${wrongId}`, null, token);
            console.log('\n📊 Wrong Submission Result:');
            console.log(`   Status: ${wrongStatus.data.status}`);
            console.log(`   Tests Passed: ${wrongStatus.data.passedTests}/${wrongStatus.data.totalTests}`);

            console.log('\n✨ End-to-End Test Complete!\n');
            return;
        }
    }

    console.log('\n⏰ Timeout waiting for execution');
}

// Run the test
testE2E().catch(console.error);
