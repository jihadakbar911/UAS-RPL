// Quick test for register API
async function testRegister() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Quick Test User',
                username: 'quicktest' + Date.now(),
                password: 'test123'
            })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testRegister();
