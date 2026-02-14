// Quick registration test
fetch('http://localhost:3001/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'quicktest@test.com',
        password: 'SecurePass123!'
    })
})
    .then(r => r.json())
    .then(d => console.log('Register:', d))
    .then(() => fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'quicktest@test.com',
            password: 'SecurePass123!'
        })
    }))
    .then(r => r.json())
    .then(d => {
        console.log('Login:', d);
        return d.access_token;
    })
    .then(token => {
        console.log('\n✅ Registration and login work!');
        console.log('Token:', token.substring(0, 20) + '...');
        console.log('\nNow you can test submissions manually or wait for the full E2E test.\n');
    })
    .catch(e => console.error('Error:', e));
