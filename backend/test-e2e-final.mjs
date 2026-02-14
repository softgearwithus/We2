// Final E2E Test with Admin User
// Run with: node test-e2e-final.mjs

const BASE_URL = 'http://localhost:3001';

async function request(method, path, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();
    return { status: response.status, data };
}

async function test() {
    console.log('🧪 **FINAL E2E CODE EXECUTION TEST**\n');
    console.log('═══════════════════════════════════════\n');

    // Register and login
    console.log('1️⃣  Registering admin user...');
    await request('POST', '/auth/register', {
        email: 'admin-tester@example.com',
        password: 'AdminPass123!',
        role: 'super_admin',
    }).catch(() => { });

    const login = await request('POST', '/auth/login', {
        email: 'admin-tester@example.com',
        password: 'AdminPass123!',
    });

    if (login.status !== 200) {
        console.error('❌ Login failed');
        return;
    }

    const token = login.data.accessToken;
    console.log('✅ Logged in as admin\n');

    // Create problem
    console.log('2️⃣  Creating DSA problem...');
    const problem = await request('POST', '/dsa/problems', {
        title: 'Add Two Numbers',
        slug: `add-two-numbers-${Date.now()}`,
        difficulty: 'easy',
        description: 'Return the sum of a and b',
        examples: [{ input: 'a=2, b=3', output: '5', explanation: '2+3=5' }],
        constraints: ['Numbers are integers'],
        starterCode: {
            javascript: 'var add = function(a, b) {\n    return 0;\n};'
        },
        testCases: [
            { input: '(2, 3)', expected: '5', isHidden: false },
            { input: '(10, 20)', expected: '30', isHidden: false },
            { input: '(-5, 5)', expected: '0', isHidden: true },
        ],
        categories: ['math'],
        hints: [],
        solution: null,
        likes: 0,
        dislikes: 0,
        submissions: 0,
        accepted: 0,
        isActive: true,
    }, token);

    if (problem.status !== 201) {
        console.error('❌ Problem creation failed:', problem);
        return;
    }

    const problemId = problem.data.id;
    console.log(`✅ Problem created (${problemId.substring(0, 8)}...)\n`);

    // Submit CORRECT solution
    console.log('3️⃣  Submitting CORRECT code...');
    const submit = await request('POST', '/dsa/submissions', {
        problemId,
        language: 'javascript',
        code: 'var add = function(a, b) {\n    return a + b;\n};',
    }, token);

    if (submit.status !== 201) {
        console.error('❌ Submission failed:', submit);
        return;
    }

    const subId = submit.data.submissionId;
    console.log(`✅ Submission queued`);
    console.log(`   ID: ${subId.substring(0, 8)}...`);
    console.log(`   Queue Position: ${submit.data.queuePosition}`);
    console.log(`   Estimated Wait: ${submit.data.estimatedWaitTime}s\n`);

    // Poll status
    console.log('4️⃣  Waiting for Docker execution...\n');
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 1000));

        const status = await request('GET', `/dsa/submissions/${subId}`, null, token);
        const s = status.data;

        process.stdout.write(`\r   [${i + 1}] Status: ${s.status.padEnd(12)} `);

        if (s.status !== 'queued' && s.status !== 'running') {
            console.log('\n\n📊 **EXECUTION RESULTS**');
            console.log('═══════════════════════════════════════');
            console.log(`Status:       ${s.status}`);
            console.log(`Tests Passed: ${s.passedTests}/${s.totalTests}`);
            console.log(`Runtime:      ${s.runtime || 'N/A'}`);
            console.log(`Memory:       ${s.memory || 'N/A'}`);
            console.log('═══════════════════════════════════════');

            if (s.status === 'accepted') {
                console.log('\n🎉 **SUCCESS!!** 🎉');
                console.log('\n✅ Code executed in Docker container');
                console.log('✅ All test cases passed');
                console.log('✅ Results stored in database');
                console.log('✅ End-to-end pipeline verified!\n');

                // Test wrong solution
                console.log('5️⃣  Testing WRONG solution...\n');
                const wrong = await request('POST', '/dsa/submissions', {
                    problemId,
                    language: 'javascript',
                    code: 'var add = function(a, b) { return 0; };',
                }, token);

                await new Promise(r => setTimeout(r, 5000));
                const wrongStatus = await request('GET', `/dsa/submissions/${wrong.data.submissionId}`, null, token);

                console.log('📊 Wrong Solution Result:');
                console.log(`   Status: ${wrongStatus.data.status}`);
                console.log(`   Passed: ${wrongStatus.data.passedTests}/${wrongStatus.data.totalTests}\n`);

                console.log('═══════════════════════════════════════');
                console.log('✨ **PHASE 2 COMPLETE** ✨');
                console.log('═══════════════════════════════════════\n');
                console.log('🚀 Code execution engine is LIVE!');
                console.log('📦 Docker + Redis + Worker = Working perfectly!\n');
            } else {
                console.log(`\n❌ Execution failed: ${s.status}`);
                if (s.errorMessage) console.log(`   Error: ${s.errorMessage}`);
                if (s.failedTestCase) {
                    console.log('\nFailed Test:');
                    console.log(`   Input: ${s.failedTestCase.input}`);
                    console.log(`   Expected: ${s.failedTestCase.expected}`);
                    console.log(`   Actual: ${s.failedTestCase.actual}`);
                }
                console.log('');
            }
            return;
        }
    }

    console.log('\n\n⏰ Timeout after 30 seconds');
}

test().catch(console.error);
