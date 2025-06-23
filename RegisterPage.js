document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing form elements');
  const registerForm = document.getElementById('registerForm');
  const idInput = document.getElementById('id');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const phoneInput = document.getElementById('phone');
  const registerBtn = document.getElementById('registerBtn');
  const loadingOverlay = document.getElementById('loading-overlay');
  const togglePassword = document.getElementById('togglePassword');
  const errorMessage = document.getElementById('error-message');
  const apiUrl = 'https://script.google.com/macros/s/AKfycbyNjbbkogc09ApMMIAq7QIPIyKiI2lpGg0qtrGYWZKjuaL7hrIZ3yxnjPMtGPyuJHDN/exec';

  console.log('Form elements initialized:', { 
    registerForm: !!registerForm, 
    idInput: !!idInput, 
    emailInput: !!emailInput 
  });

  const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => errorMessage.classList.add('hidden'), 5000);
  };

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = idInput.value.trim();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const phone = phoneInput.value.trim();
    
    console.log('Form submitted with values:', { id, name, email, phone, passwordLength: password.length });

    errorMessage.classList.add('hidden');

    if (!id || !name || !email || !password) {
      console.log('Validation failed: Required fields missing');
      showError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed: Invalid email format');
      showError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      console.log('Validation failed: Password too short');
      showError('Password must be at least 8 characters long.');
      return;
    }

    if (phone && !/^\d{7,15}$/.test(phone)) {
      console.log('Validation failed: Invalid phone format');
      showError('Phone number must be 7-15 digits.');
      return;
    }

    try {
      console.log('Starting registration process');
      loadingOverlay.classList.remove('hidden');
      registerBtn.disabled = true;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'insert',
          id,
          name,
          email,
          password,
          phone: phone || ''
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      console.log('Received response:', result);

      if (result.status !== 'success') {
        console.log('Registration failed:', result);
        showError(result.data || 'Registration failed. Please try again.');
        loadingOverlay.classList.add('hidden');
        registerBtn.disabled = false;
        return;
      }

      console.log('Registration successful, storing data in localStorage');
      localStorage.setItem('id', id);
      localStorage.setItem('name', name);
      localStorage.setItem('email', email);
      localStorage.setItem('phone', phone || '');
      loadingOverlay.classList.add('hidden');
      registerBtn.disabled = false;
      window.location.href = "LoginPage.html";
    } catch (error) {
      console.error('Registration error:', error);
      showError(error.name === 'AbortError' ? 'Request timed out. Please try again.' : 'An error occurred during registration.');
      loadingOverlay.classList.add('hidden');
      registerBtn.disabled = false;
    }
  });

  togglePassword.addEventListener('click', () => {
    console.log('Toggling password visibility');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
    togglePassword.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
  });
});