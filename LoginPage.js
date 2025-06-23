document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorDiv = document.getElementById('error');
  const loadingOverlay = document.getElementById('loading-overlay');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const apiUrl = 'https://script.google.com/macros/s/AKfycbyGMGfyqzTlxB7LQ-aL2jl52y45QmJYwJo93eO-o2va6sx9Sl7gf1epjfctiiOpF71y/exec';

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      errorDiv.classList.remove('hidden');
      errorDiv.textContent = 'Please enter both email and password';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorDiv.classList.remove('hidden');
      errorDiv.textContent = 'Please enter a valid email address';
      return;
    }

    try {
      loadingOverlay.classList.remove('hidden');
      errorDiv.classList.add('hidden');

      const response = await fetch(`${apiUrl}?action=read`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.status !== 'success') {
        errorDiv.classList.remove('hidden');
        errorDiv.textContent = result.message || 'Failed to fetch user data';
        return;
      }

      const user = result.data.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        String(u.password) === password
      );

      if (!user) {
        errorDiv.classList.remove('hidden');
        errorDiv.textContent = 'Incorrect email or password';
        return;
      }

      localStorage.setItem('id', user.id);
      localStorage.setItem('name', user.name);
      localStorage.setItem('email', user.email);
      localStorage.setItem('phone', user.phone || '');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Login error:', error);
      errorDiv.classList.remove('hidden');
      if (error.message.includes('HTTP error')) {
        errorDiv.textContent = `Server error: ${error.message}. Verify API URL and deployment.`;
      } else if (error.message.includes('Failed to fetch')) {
        errorDiv.textContent = 'Network error: Unable to connect to the server. Check API URL or network connection.';
      } else {
        errorDiv.textContent = `Error: ${error.message}. Please try again.`;
      }
    } finally {
      loadingOverlay.classList.add('hidden');
    }
  });

  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';
    });
  });
  const togglePassword = document.getElementById('togglePassword');

  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
  });
});