const http = require('http');

function request(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

async function run() {
    console.log('Logging in...');
    const loginData = JSON.stringify({ email: 'bimaltyagi333@gmail.com', password: '123Bimal%' });
    const loginRes = await request({
        hostname: 'localhost', port: 3001, path: '/api/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
    }, loginData);

    const token = JSON.parse(loginRes.body).access_token;
    console.log('Token acquired');

    const compRes = await request({
        hostname: 'localhost', port: 3001, path: '/api/test-series/admin/companies', method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const companyId = JSON.parse(compRes.body)[0].id;
    console.log('Company:', companyId);

    const hierRes = await request({
        hostname: 'localhost', port: 3001, path: `/api/test-series/student/companies/${companyId}/hierarchy`, method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const sectionId = JSON.parse(hierRes.body).mockTests[0].sections[0].id;
    console.log('Section:', sectionId);

    const payload = JSON.stringify({
        questions: [{
            type: 'SINGLE_CORRECT',
            question: 'What is 2+2?',
            marks: 1,
            solutionText: '4',
            options: ['2', '3', '4', '5'],
            correctAnswer: '4'
        }]
    });

    console.log('Sending Add Question payload to section', sectionId);
    const addRes = await request({
        hostname: 'localhost', port: 3001, path: `/api/test-series/admin/sections/${sectionId}/bulk-questions`, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length, 'Authorization': `Bearer ${token}` }
    }, payload);

    console.log('STATUS:', addRes.status);
    console.log('BODY:', addRes.body);
}

run().catch(e => console.error('SCRIPT CRASHED:', e));
