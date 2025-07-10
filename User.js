const API_URL = 'https://script.google.com/macros/s/AKfycby7OJMHg1GOMe0_5D-qOVmZ-6N_0uRicnzWFdNo1L2ju74TVN5wauI8rkPf7lHj3kwWyA/exec';
let allUsers = [];

function sanitizeInput(input) {
  if (typeof input !== 'string') return input || '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

function validateId(id) {
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return 'User ID must contain only letters, numbers, underscores, or hyphens';
  return null;
}

function validateName(name) {
  if (!name || name.length < 2) return 'Name must be at least 2 characters long';
  if (name.length > 50) return 'Name cannot exceed 50 characters';
  return null;
}

function validateEmail(email) {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  if (email.length > 100) return 'Email cannot exceed 100 characters';
  return null;
}

function validatePhone(phone) {
  if (phone && !/^\+?[\d\s-]{7,15}$/.test(phone)) return 'Phone number must be 7-15 digits, optionally with spaces, hyphens, or a leading +';
  return null;
}

function validateLocation(location) {
  if (location && location.length > 100) return 'Location cannot exceed 100 characters';
  return null;
}

async function loadUsers() {
  toggleLoading(true);
  try {
    const response = await fetch(`${API_URL}?action=read`);
    const data = await response.json();
    toggleLoading(false);
    if (data.status === 'success' && Array.isArray(data.data)) {
      allUsers = data.data;
      renderTable(allUsers);
    } else {
      showError(data.message || 'Invalid data format');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to load users. Please check your connection.');
    console.error('Error loading users:', error);
  }
}

function renderTable(users) {
  const tableBody = document.getElementById('user-table-body');
  tableBody.innerHTML = '';
  if (users.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="px-4 py-2 text-center text-gray-400 font-sans text-sm">No users found</td></tr>';
    return;
  }
  users.forEach(user => {
    const row = document.createElement('tr');
    row.classList.add('hover:bg-[#252550]', 'transition-all', 'duration-300', 'border-b', 'border-[#00ddeb]');
    row.innerHTML = `
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(user.ID) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(user.Name) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(user.Email) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(user.Phone) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(user.Location) || 'N/A'}</td>
                    <td class="px-4 py-2 text-center">
                        <button onclick="openEditModal('${sanitizeInput(user.ID)}', '${sanitizeInput(user.Name)}', '${sanitizeInput(user.Email)}', '${sanitizeInput(user.Phone)}', '${sanitizeInput(user.Location)}')" 
                            class="bg-[#00ddeb] text-[#1a1a2e] px-2 py-1 rounded-md mr-2 hover:bg-[#00b8c4] transition-all duration-300 shadow-[0_0_10px_rgba(0,221,235,0.5)]">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button onclick="deleteUser('${sanitizeInput(user.ID)}')" 
                            class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-all duration-300 shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

document.getElementById('user-search')?.addEventListener('input', debounce((e) => {
  const query = e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filteredUsers = allUsers.filter(user =>
    (user.Name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
    (user.Email || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
    (user.Phone || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
    (user.Location || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query)
  );
  renderTable(filteredUsers);
}, 300));

document.getElementById('add-user-btn')?.addEventListener('click', () => {
  document.getElementById('add-user-form').reset();
  document.getElementById('add-user-modal').classList.remove('hidden');
});

document.getElementById('close-add-user-modal')?.addEventListener('click', () => {
  document.getElementById('add-user-form').reset();
  document.getElementById('add-user-modal').classList.add('hidden');
});

document.getElementById('cancel-add-user')?.addEventListener('click', () => {
  document.getElementById('add-user-form').reset();
  document.getElementById('add-user-modal').classList.add('hidden');
});

document.getElementById('add-user-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoadingadd(true);
  const id = document.getElementById('add-user-id').value.trim();
  const name = document.getElementById('add-user-name').value.trim();
  const email = document.getElementById('add-user-email').value.trim();
  const phone = document.getElementById('add-user-phone').value.trim() || '';
  const location = document.getElementById('add-user-location').value.trim() || '';

  let error = validateId(id);
  if (error) {
    toggleLoadingadd(false);
    showError(error);
    return;
  }
  error = validateName(name);
  if (error) {
    toggleLoadingadd(false);
    showError(error);
    return;
  }
  error = validateEmail(email);
  if (error) {
    toggleLoadingadd(false);
    showError(error);
    return;
  }
  error = validatePhone(phone);
  if (error) {
    toggleLoadingadd(false);
    showError(error);
    return;
  }
  error = validateLocation(location);
  if (error) {
    toggleLoadingadd(false);
    showError(error);
    return;
  }

  try {
    const formData = new URLSearchParams({
      action: 'insert',
      ID: id,
      Name: name,
      Email: email,
      Phone: phone,
      Location: location
    });
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await response.json();
    toggleLoadingadd(false);
    if (data.status === 'success') {
      document.getElementById('add-user-form').reset();
      document.getElementById('add-user-modal').classList.add('hidden');
      await loadUsers();
      showNotification('Success', 'User added successfully!');
    } else {
      showError(data.message || 'Failed to add user');
    }
  } catch (error) {
    toggleLoadingadd(false);
    showError('Failed to add user. Please check your connection.');
    console.error('Error adding user:', error);
  }
});

function openEditModal(id, name, email, phone, location) {
  document.getElementById('edit-user-id').value = id || '';
  document.getElementById('edit-user-name').value = name === 'N/A' ? '' : name;
  document.getElementById('edit-user-email').value = email === 'N/A' ? '' : email;
  document.getElementById('edit-user-phone').value = phone === 'N/A' ? '' : phone;
  document.getElementById('edit-user-location').value = location === 'N/A' ? '' : location;
  document.getElementById('edit-user-modal').classList.remove('hidden');
}

document.getElementById('close-edit-user-modal')?.addEventListener('click', () => {
  document.getElementById('edit-user-form').reset();
  document.getElementById('edit-user-modal').classList.add('hidden');
});

document.getElementById('cancel-edit-user')?.addEventListener('click', () => {
  document.getElementById('edit-user-form').reset();
  document.getElementById('edit-user-modal').classList.add('hidden');
});

document.getElementById('edit-user-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoadingedit(true);
  const id = document.getElementById('edit-user-id').value;
  const name = document.getElementById('edit-user-name').value.trim();
  const email = document.getElementById('edit-user-email').value.trim();
  const phone = document.getElementById('edit-user-phone').value.trim() || '';
  const location = document.getElementById('edit-user-location').value.trim() || '';

  let error = validateName(name);
  if (error) {
    toggleLoadingedit(false);
    showError(error);
    return;
  }
  error = validateEmail(email);
  if (error) {
    toggleLoadingedit(false);
    showError(error);
    return;
  }
  error = validatePhone(phone);
  if (error) {
    toggleLoadingedit(false);
    showError(error);
    return;
  }
  error = validateLocation(location);
  if (error) {
    toggleLoadingedit(false);
    showError(error);
    return;
  }

  try {
    const formData = new URLSearchParams({
      action: 'update',
      id: id,
      ID: id,
      Name: name,
      Email: email,
      Phone: phone,
      Location: location
    });
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await response.json();
    toggleLoadingedit(false);
    if (data.status === 'success') {
      document.getElementById('edit-user-form').reset();
      document.getElementById('edit-user-modal').classList.add('hidden');
      await loadUsers();
      showNotification('Success', 'User updated successfully!');
    } else {
      showError(data.message || 'Failed to update user');
    }
  } catch (error) {
    toggleLoadingedit(false);
    showError('Failed to update user. Please check your connection.');
    console.error('Error updating user:', error);
  }
});

async function deleteUser(id) {
  showConfirmBox('Are you sure you want to delete this user?', async () => {
    toggleLoading(true);
    try {
      const formData = new URLSearchParams({
        action: 'delete',
        id: id
      });
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      const data = await response.json();
      toggleLoading(false);
      if (data.status === 'success') {
        await loadUsers();
        showNotification('Success', 'User deleted successfully!');
      } else {
        showError(data.message || 'Failed to delete user');
      }
    } catch (error) {
      toggleLoading(false);
      showError('Failed to delete user. Please check your connection.');
      console.error('Error deleting user:', error);
    }
  });
}

loadUsers();
