document.addEventListener('DOMContentLoaded', () => {
  const resetForm = document.getElementById('resetForm');
  const emailInput = document.getElementById('email');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const submitBtn = document.getElementById('submitBtn');
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');
  const passwordSection = document.getElementById('passwordSection');
  const toggleNewPassword = document.getElementById('toggleNewPassword');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const apiUrl = 'https://script.google.com/macros/s/AKfycbyENKMzyaE5SjfezoAzVt2QLperscP9npjLkHJ_csM-UEylG8B3e3-eI2YKoabA9P3t/exec';
  let verifiedUser = null;

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');

    const email = emailInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!email) {
      errorDiv.classList.remove('hidden');
      errorDiv.textContent = 'Please enter your email';
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
      loadingText.textContent = verifiedUser ? 'Updating Password...' : 'Verifying Email...';

      if (!verifiedUser) {
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

        verifiedUser = result.data.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!verifiedUser) {
          errorDiv.classList.remove('hidden');
          errorDiv.textContent = 'Email not found';
          return;
        }

        passwordSection.classList.remove('hidden');
        submitBtn.textContent = 'Reset Password';
        emailInput.setAttribute('readonly', true);
      } else {
        if (!newPassword || !confirmPassword) {
          errorDiv.classList.remove('hidden');
          errorDiv.textContent = 'Please enter and confirm your new password';
          return;
        }

        if (newPassword !== confirmPassword) {
          errorDiv.classList.remove('hidden');
          errorDiv.textContent = 'Passwords do not match';
          return;
        }

        if (newPassword.length < 6) {
          errorDiv.classList.remove('hidden');
          errorDiv.textContent = 'Password must be at least 6 characters';
          return;
        }

        const updateResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            action: 'update',
            id: verifiedUser.id,
            image: verifiedUser.image,
            email: verifiedUser.email,
            password: newPassword,
            name: verifiedUser.name,
            phone: verifiedUser.phone || ''
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
        successDiv.textContent = 'Password reset successfully! Redirecting to login...';
        setTimeout(() => {
          window.location.href = 'LoginPage.html';
        }, 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
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

  [emailInput, newPasswordInput, confirmPasswordInput].forEach(input => {
    input.addEventListener('input', () => {
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';
    });
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