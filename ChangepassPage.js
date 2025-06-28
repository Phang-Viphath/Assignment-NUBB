document.addEventListener('DOMContentLoaded', () => {
  const changePassForm = document.getElementById('changePassForm');
  const emailInput = document.getElementById('email');
  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const submitBtn = document.getElementById('submitBtn');
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');
  const loadingOverlay = document.getElementById('loading-overlay');
  const toggleCurrentPassword = document.getElementById('toggleCurrentPassword');
  const toggleNewPassword = document.getElementById('toggleNewPassword');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const apiUrl = 'https://script.google.com/macros/s/AKfycbyNjbbkogc09ApMMIAq7QIPIyKiI2lpGg0qtrGYWZKjuaL7hrIZ3yxnjPMtGPyuJHDN/exec';

  changePassForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');

    const email = emailInput.value.trim();
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      errorDiv.classList.remove('hidden');
      errorDiv.textContent = 'Please fill in all fields';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorDiv.classList.remove('hidden');
      errorDiv.textContent = 'Please enter a valid email address';
      return;
    }

    if (newPassword !== confirmPassword) {
      errorDiv.classList.remove('hidden');
      errorDiv.textContent = 'New passwords do not match';
      return;
    }

    if (newPassword.length < 6) {
      errorDiv.classList.remove('hidden');
      errorDiv.textContent = 'New password must be at least 6 characters';
      return;
    }

    try {
      loadingOverlay.classList.remove('hidden');
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
        throw new Error(result.message || 'Failed to fetch user data');
      }

      const user = result.data.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        String(u.password) === currentPassword
      );

      if (!user) {
        errorDiv.classList.remove('hidden');
        errorDiv.textContent = 'Incorrect email or current password';
        return;
      }
      const updateResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'update',
          id: user.id,
          email: user.email,
          password: newPassword,
          name: user.name,
          phone: user.phone || ''
        })
      });

      if (!updateResponse.ok) {
        throw new Error(`HTTP error ${updateResponse.status}: ${updateResponse.statusText}`);
      }

      const updateResult = await updateResponse.json();

      if (updateResult.status !== 'success') {
        throw new Error(updateResult.data || 'Failed to update password');
      }

      successDiv.classList.remove('hidden');
      successDiv.textContent = 'Password changed successfully! Redirecting to login...';
      setTimeout(() => {
        window.location.href = 'LoginPage.html';
      }, 2000);
    } catch (error) {
      console.error('Change password error:', error);
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

  [emailInput, currentPasswordInput, newPasswordInput, confirmPasswordInput].forEach(input => {
    input.addEventListener('input', () => {
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';
    });
  });

  toggleCurrentPassword.addEventListener('click', () => {
    const type = currentPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    currentPasswordInput.setAttribute('type', type);
    toggleCurrentPassword.classList.toggle('fa-eye');
    toggleCurrentPassword.classList.toggle('fa-eye-slash');
  });

  toggleNewPassword.addEventListener('click', () => {
    const type = newPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    newPasswordInput.setAttribute('type', type);
    toggleNewPassword.classList.toggle('fa-eye');
    toggleNewPassword.classList.toggle('fa-eye-slash');
  });

  toggleConfirmPassword.addEventListener('click', () => {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    toggleConfirmPassword.classList.toggle('fa-eye');
    toggleConfirmPassword.classList.toggle('fa-eye-slash');
  });
});