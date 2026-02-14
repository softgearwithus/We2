// Simpler E2E test - just login and test
// Run with: node test-submission-simple.mjs

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
    console.log('🧪 E2E Code Execution Test\n');

    // Try to register (ignore if exists)
    console.log('1️⃣ Registering...');
    await request('POST', '/auth/register', {
        email: 'codertester@example.com',
        password: 'SecurePass123!',
    }).catch(() => { });

    // Login
    console.log('2️⃣ Logging in...');
    const login = await request('POST', '/auth/login', {
        email: 'codertester@example.com',
        password: 'SecurePass123!',
    });

    if (login.status !== 200) {
        console.error(' Login failed:', login);
        return;
    }

    const token = login.data.accessToken || login.data.access_token;
    console.log('✅ Logged in\n');

    // Create problem
    console.log('3️⃣ Creating test problem...');
    const problem = await request('POST', '/dsa/problems', {
        title: 'Add Numbers',
        slug: `add-nums-${Date.now()}`,
        difficulty: 'easy',
        description: 'Return the sum of a and b',
        examples: [{ input: 'a=2, b=3', output: '5', explanation: '' }],
        constraints: [],
        starterCode: { javascript: 'var add = function(a, b) { return 0; };' },
        testCases: [
            { input: '(2, 3)', expected: '5', isHidden: false },
            { input: '(10, 5)', expected: '15', isHidden: false },
        ],
        categories: [],
        hints: [],
        solution: null,
        likes: 0,
        dislikes: 0,
        submissions: 0,
        accepted: 0,
        isActive: true,
    }, token);

    if (problem.status !== 201) {
        console.error('❌ Problem failed:', problem);
        return;
    }

    const problemId = problem.data.id;
    console.log(`✅ Problem ID: ${problemId}\n`);

    // Submit code
    console.log('4️⃣ Submitting code...');
    const submit = await request('POST', '/dsa/submissions', {
        problemId,
        language: 'javascript',
        code: 'var add = function(a, b) { return a + b; };',
    }, token);

    if (submit.status !== 201) {
        console.error('❌ Submission failed:', submit);
        return;
    }

    const subId = submit.data.submissionId;
    console.log('✅ Queued:', subId);
    console.log(`   Position: ${submit.data.queuePosition}\n`);

    // Poll for results
    console.log('5️⃣ Waiting for execution...');
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 1000));

        const status = await request('GET', `/dsa/submissions/${subId}`, null, token);
        console.log(`   [${i + 1}] ${status.data.status}`);

        if (status.data.status !== 'queued' && status.data.status !== 'running') {
            console.log('\n📊 RESULTS:');
            console.log('═══════════════════════════════');
            console.log(`Status:  ${status.data.status}`);
            console.log(`Passed:  ${status.data.passedTests}/${status.data.totalTests}`);
            console.log(`Runtime: ${status.data.runtime || 'N/A'}`);
            console.log(`Memory:  ${status.data.memory || 'N/A'}`);
            console.log('═══════════════════════════════');

            if (status.data.status === 'accepted') {
                console.log('\n🎉 SUCCESS!! Code executed in Docker!\n');
            } else {
                console.log(`\n❌ Failed: ${status.data.errorMessage || status.data.status}\n`);
            }
            return;
        }
    }

    console.log('\n⏰ Timeout\n');
}

test().catch(console.error);
