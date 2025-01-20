const url = 'https://asjhwvpavluqtwhedjcb.supabase.co/rest/v1/USER';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzamh3dnBhdmx1cXR3aGVkamNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5Mzc4MjYsImV4cCI6MjA1MDUxMzgyNn0.wSwmSssUykAMNiyoB3TXuxcr3VzgKSdTpfgehHtHWcA';

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${url}?EMAIL=eq.${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const users = await response.json();

    if (users.length === 0 || users[0].PASSWORD !== password) {
      loginError.textContent = 'Invalid email or password.';
      return;
    }

    // Store the email in localStorage after successful login
    localStorage.setItem('email', email);


    // Optionally, store session token if needed
    localStorage.setItem('session_token', 'VALID_SESSION_TOKEN'); // Replace with the actual token if generated

    // Redirect to dashboard or another page
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Error:', error);
    loginError.textContent = 'An error occurred. Please try again.';
  }
});
