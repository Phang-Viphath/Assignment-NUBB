document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing form elements');
  const registerForm = document.getElementById('registerForm');
  const idInput = document.getElementById('id');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const phoneInput = document.getElementById('phone');
  const registerFrame = document.getElementById('registerFrame');
  const registerBtn = document.getElementById('registerBtn');
  const loadingOverlay = document.getElementById('loading-overlay');
  const togglePassword = document.getElementById('togglePassword');
  const apiUrl = 'https://script.google.com/macros/s/AKfycbzwMnxHUhNI5MD87ur1gmhAh_Jco2dEHc3C8dHjhyVPTiDHEkzRPmU7OVLLLkwY-xyi/exec';

  console.log('Form elements initialized:', { 
    registerForm: !!registerForm, 
    idInput: !!idInput, 
    emailInput: !!emailInput 
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = idInput.value.trim();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const phone = phoneInput.value.trim();
    
    console.log('Form submitted with values:', { id, name, email, phone, passwordLength: password.length });

    if (!id || !name || !email || !password) {
      console.log('Validation failed: Required fields missing');
      window.location.href = "LoginPage.html"; 
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed: Invalid email format');
      window.location.href = "LoginPage.html"; 
      return;
    }

    if (password.length < 8) {
      console.log('Validation failed: Password too short');
      window.location.href = "LoginPage.html";
      return;
    }

    if (phone && !/^\d{7,15}$/.test(phone)) {
      console.log('Validation failed: Invalid phone format');
      window.location.href = "LoginPage.html"; 
      return;
    }

    try {
      console.log('Starting registration process');
      loadingOverlay.classList.remove('hidden');
      registerBtn.disabled = true;

      const tempForm = document.createElement('form');
      tempForm.method = 'POST';
      tempForm.action = apiUrl;
      tempForm.target = 'registerFrame';
      tempForm.style.display = 'none';

      const fields = { action: 'insert', id, name, email, password, phone: phone || '' };
      console.log('Submitting form data:', fields);
      
      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        tempForm.appendChild(input);
      }

      document.body.appendChild(tempForm);

      const handleFrameLoad = async () => {
        try {
          const responseText = registerFrame.contentWindow.document.body.innerText;
          console.log('Received response:', responseText);
          const result = JSON.parse(responseText);
          console.log('Parsed response:', result);

          if (result.status !== 'success') {
            console.log('Registration failed:', result);
            loadingOverlay.classList.add('hidden'); 
            registerBtn.disabled = false; 
            window.location.href = "LoginPage.html"; 
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
          console.error('Registration error in frame load:', error);
          loadingOverlay.classList.add('hidden'); 
          registerBtn.disabled = false; 
          window.location.href = "LoginPage.html"; 
        } finally {
          console.log('Cleaning up temporary form');
          document.body.removeChild(tempForm);
          registerFrame.removeEventListener('load', handleFrameLoad);
        }
      };

      registerFrame.addEventListener('load', handleFrameLoad);
      console.log('Submitting temporary form');
      tempForm.submit();
    } catch (error) {
      console.error('Registration error in main try block:', error);
      loadingOverlay.classList.add('hidden');
      registerBtn.disabled = false;
      window.location.href = "LoginPage.html"; 
    }
  });

  togglePassword.addEventListener('click', () => {
    console.log('Toggling password visibility');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
  });
});