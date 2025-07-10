const API_URL = 'https://script.google.com/macros/s/AKfycbxIcauLLR9FGcKvBnzO44OkQb0LefE7UEZmwHJmv91NVXBQWmDSnKGQW24YICJGQKq00g/exec';
let allRoles = [];

function formatDate(dateStr) {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toISOString().split('T')[0];
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input || '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

function validateId(id) {
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return 'Role ID must contain only letters, numbers, underscores, or hyphens';
  return null;
}

function validateName(name) {
  if (!name || name.length < 2) return 'Name must be at least 2 characters long';
  if (name.length > 50) return 'Name cannot exceed 50 characters';
  return null;
}

function validateDescription(description) {
  if (description && description.length > 500) return 'Description cannot exceed 500 characters';
  return null;
}

function validateDate(date) {
  if (!date || date === 'N/A' || date === '') return null;
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Please enter a valid date (YYYY-MM-DD)';
  const formattedDate = dateObj.toISOString().split('T')[0];
  if (date !== formattedDate) return 'Please enter a valid date (YYYY-MM-DD)';
  return null;
}

function validateStatus(status) {
  if (status && !['Active', 'Inactive'].includes(status)) return 'Status must be Active or Inactive';
  return null;
}

async function loadRoles() {
  toggleLoading(true);
  try {
    const response = await fetch(`${API_URL}?action=read`);
    const data = await response.json();
    toggleLoading(false);
    if (data.status === 'success' && Array.isArray(data.data)) {
      console.log('Raw API data:', data.data);
      allRoles = data.data;
      renderTable(allRoles);
    } else {
      showError(data.message || 'Invalid data format');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to load roles. Please check your connection.');
    console.error('Error loading roles:', error);
  }
}

function renderTable(roles) {
  const tableBody = document.getElementById('role-table-body');
  tableBody.innerHTML = '';
  if (roles.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="px-4 py-2 text-center text-gray-400 font-sans text-sm">No roles found</td></tr>';
    return;
  }
  roles.forEach(role => {
    const row = document.createElement('tr');
    row.classList.add('hover:bg-[#252550]', 'transition-all', 'duration-300', 'border-b', 'border-[#00ddeb]');
    row.innerHTML = `
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(role.ID) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(role.Name) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(role.Description) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${formatDate(role.Date)}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(role.Status) || 'N/A'}</td>
                    <td class="px-4 py-2 text-center">
                        <button onclick="openEditModal('${sanitizeInput(role.ID)}', '${sanitizeInput(role.Name)}', '${sanitizeInput(role.Description)}', '${sanitizeInput(role.Date)}', '${sanitizeInput(role.Status)}')" 
                            class="bg-[#00ddeb] text-[#1a1a2e] px-2 py-1 rounded-md mr-2 hover:bg-[#00b8c4] transition-all duration-300 shadow-[0_0_10px_rgba(0,221,235,0.5)]">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button onclick="deleteRole('${sanitizeInput(role.ID)}')" 
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

document.getElementById('role-search')?.addEventListener('input', debounce((e) => {
  const query = e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filteredRoles = allRoles.filter(role =>
    (role.Name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
    (role.Description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query)
  );
  renderTable(filteredRoles);
}, 300));

document.getElementById('add-role-btn')?.addEventListener('click', () => {
  document.getElementById('add-role-form').reset();
  document.getElementById('add-role-modal').classList.remove('hidden');
});

document.getElementById('close-add-role-modal')?.addEventListener('click', () => {
  document.getElementById('add-role-form').reset();
  document.getElementById('add-role-modal').classList.add('hidden');
});

document.getElementById('cancel-add-role')?.addEventListener('click', () => {
  document.getElementById('add-role-form').reset();
  document.getElementById('add-role-modal').classList.add('hidden');
});

document.getElementById('add-role-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoadingadd(true);
  const id = document.getElementById('add-role-id').value.trim();
  const name = document.getElementById('add-role-name').value.trim();
  const description = document.getElementById('add-role-description').value.trim();
  const date = document.getElementById('add-role-date').value || 'N/A';
  const status = document.getElementById('add-role-status').value;

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
  error = validateDescription(description);
  if (error) {
    toggleLoadingadd(false);
    showError(error);
    return;
  }
  error = validateDate(date);
  if (error) {
    toggleLoadingadd(false);
    showError(error);
    return;
  }
  error = validateStatus(status);
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
      Description: description,
      Date: date === 'N/A' ? '' : date,
      Status: status
    });
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await response.json();
    toggleLoadingadd(false);
    if (data.status === 'success') {
      document.getElementById('add-role-form').reset();
      document.getElementById('add-role-modal').classList.add('hidden');
      await loadRoles();
      showNotification('Success', 'Role added successfully!');
    } else {
      showError(data.message || 'Failed to add role');
    }
  } catch (error) {
    toggleLoadingadd(false);
    showError('Failed to add role. Please check your connection.');
    console.error('Error adding role:', error);
  }
});

function openEditModal(id, name, description, date, status) {
  document.getElementById('edit-role-id').value = id || '';
  document.getElementById('edit-role-name').value = name === 'N/A' ? '' : name;
  document.getElementById('edit-role-description').value = description === 'N/A' ? '' : description;
  document.getElementById('edit-role-date').value = formatDate(date);
  document.getElementById('edit-role-status').value = status === 'N/A' ? 'Active' : status;
  document.getElementById('edit-role-modal').classList.remove('hidden');
}

document.getElementById('close-edit-role-modal')?.addEventListener('click', () => {
  document.getElementById('edit-role-form').reset();
  document.getElementById('edit-role-modal').classList.add('hidden');
});

document.getElementById('cancel-edit-role')?.addEventListener('click', () => {
  document.getElementById('edit-role-form').reset();
  document.getElementById('edit-role-modal').classList.add('hidden');
});

document.getElementById('edit-role-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoadingedit(true);
  const id = document.getElementById('edit-role-id').value;
  const name = document.getElementById('edit-role-name').value.trim();
  const description = document.getElementById('edit-role-description').value.trim();
  const date = document.getElementById('edit-role-date').value || 'N/A';
  const status = document.getElementById('edit-role-status').value;

  let error = validateName(name);
  if (error) {
    toggleLoadingedit(false);
    showError(error);
    return;
  }
  error = validateDescription(description);
  if (error) {
    toggleLoadingedit(false);
    showError(error);
    return;
  }
  error = validateDate(date);
  if (error) {
    toggleLoadingedit(false);
    showError(error);
    return;
  }
  error = validateStatus(status);
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
      Description: description,
      Date: date === 'N/A' ? '' : date,
      Status: status
    });
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await response.json();
    toggleLoadingedit(false);
    if (data.status === 'success') {
      document.getElementById('edit-role-form').reset();
      document.getElementById('edit-role-modal').classList.add('hidden');
      await loadRoles();
      showNotification('Success', 'Role updated successfully!');
    } else {
      showError(data.message || 'Failed to update role');
    }
  } catch (error) {
    toggleLoadingedit(false);
    showError('Failed to update role. Please check your connection.');
    console.error('Error updating role:', error);
  }
});

async function deleteRole(id) {
  showConfirmBox('Are you sure you want to delete this role?', async () => {
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
        await loadRoles();
        showNotification('Success', 'Role deleted successfully!');
      } else {
        showError(data.message || 'Failed to delete role');
      }
    } catch (error) {
      toggleLoading(false);
      showError('Failed to delete role. Please check your connection.');
      console.error('Error deleting role:', error);
    }
  });
}

loadRoles();
