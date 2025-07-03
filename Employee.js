const API_URL = 'https://script.google.com/macros/s/AKfycbwMwJurcnpBSqaLWDgFLmpeaxjnM0i9IbRno5ovH0zvZ5sUHnxf1w6pQ-WnuV724-njPw/exec';
let allEmployees = [];

function toggleLoading(show) {
  document.getElementById('loading-overlay').classList.toggle('hidden', !show);
}

function showError(message) {
  showNotification('Error', message);
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input || '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

function validateId(id) {
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return 'Employee ID must contain only letters, numbers, underscores, or hyphens';
  return null;
}

function validateName(name) {
  if (!name || name.length < 2) return 'Name must be at least 2 characters long';
  if (name.length > 50) return 'Name cannot exceed 50 characters';
  return null;
}

function validateEmail(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
  return null;
}

function validatePhone(phone) {
  if (phone && !/^\+?\d{7,15}$/.test(phone.replace(/\s|-/g, ''))) return 'Please enter a valid phone number';
  return null;
}

function validatePosition(position) {
  if (!position || position.length < 2) return 'Position must be at least 2 characters long';
  if (position.length > 50) return 'Position cannot exceed 50 characters';
  return null;
}

async function loadEmployees() {
  toggleLoading(true);
  try {
    const response = await fetch(`${API_URL}?action=read`);
    const data = await response.json();
    toggleLoading(false);
    if (data.status === 'success' && Array.isArray(data.data)) {
      allEmployees = data.data;
      renderTable(allEmployees);
    } else {
      showError(data.data || data.message || 'Invalid data format');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to load employees. Please check your connection.');
    console.error('Error loading employees:', error);
  }
}

function renderTable(employees) {
  const tableBody = document.getElementById('employee-table-body');
  tableBody.innerHTML = '';
  if (employees.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="px-4 py-2 text-center text-gray-400 font-sans text-sm">No employees found</td></tr>';
    return;
  }
  employees.forEach(employee => {
    const row = document.createElement('tr');
    row.classList.add('hover:bg-[#252550]', 'transition-all', 'duration-300', 'border-b', 'border-[#00ddeb]');
    row.innerHTML = `
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(employee.id) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(employee.name) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(employee.email) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(employee.phone) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(employee.position) || 'N/A'}</td>
                    <td class="px-4 py-2 text-center">
                        <button onclick="openEditModal('${sanitizeInput(employee.id)}', '${sanitizeInput(employee.name)}', '${sanitizeInput(employee.email)}', '${sanitizeInput(employee.phone)}', '${sanitizeInput(employee.position)}')" 
                            class="bg-[#00ddeb] text-[#1a1a2e] px-2 py-1 rounded-md mr-2 hover:bg-[#00b8c4] transition-all duration-300 shadow-[0_0_10px_rgba(0,221,235,0.5)]">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button onclick="deleteEmployee('${sanitizeInput(employee.id)}')" 
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

document.getElementById('employee-search')?.addEventListener('input', debounce((e) => {
  const query = e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filteredEmployees = allEmployees.filter(employee =>
    (employee.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
    (employee.email || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
    (employee.position || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query)
  );
  renderTable(filteredEmployees);
}, 300));

document.getElementById('add-employee-btn')?.addEventListener('click', () => {
  document.getElementById('add-employee-form').reset();
  document.getElementById('add-employee-modal').classList.remove('hidden');
});

document.getElementById('close-add-employee-modal')?.addEventListener('click', () => {
  document.getElementById('add-employee-form').reset();
  document.getElementById('add-employee-modal').classList.add('hidden');
});

document.getElementById('cancel-add-employee')?.addEventListener('click', () => {
  document.getElementById('add-employee-form').reset();
  document.getElementById('add-employee-modal').classList.add('hidden');
});

document.getElementById('add-employee-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoading(true);
  const id = document.getElementById('add-employee-id').value.trim();
  const name = document.getElementById('add-employee-name').value.trim();
  const email = document.getElementById('add-employee-email').value.trim();
  const phone = document.getElementById('add-employee-phone').value.trim();
  const position = document.getElementById('add-employee-position').value.trim();

  // Validation
  let error = validateId(id);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validateName(name);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validateEmail(email);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validatePhone(phone);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validatePosition(position);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }

  try {
    const formData = new URLSearchParams({
      action: 'insert',
      id,
      name,
      email,
      phone,
      position
    });
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await response.json();
    toggleLoading(false);
    if (data.status === 'success') {
      document.getElementById('add-employee-form').reset();
      document.getElementById('add-employee-modal').classList.add('hidden');
      await loadEmployees();
      showNotification('Success', 'Employee added successfully!');
    } else {
      showError(data.data || data.message || 'Failed to add employee');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to add employee. Please check your connection.');
    console.error('Error adding employee:', error);
  }
});

function openEditModal(id, name, email, phone, position) {
  document.getElementById('edit-employee-id').value = id || '';
  document.getElementById('edit-employee-name').value = name === 'N/A' ? '' : name;
  document.getElementById('edit-employee-email').value = email === 'N/A' ? '' : email;
  document.getElementById('edit-employee-phone').value = phone === 'N/A' ? '' : phone;
  document.getElementById('edit-employee-position').value = position === 'N/A' ? '' : position;
  document.getElementById('edit-employee-modal').classList.remove('hidden');
}

document.getElementById('close-edit-employee-modal')?.addEventListener('click', () => {
  document.getElementById('edit-employee-form').reset();
  document.getElementById('edit-employee-modal').classList.add('hidden');
});

document.getElementById('cancel-edit-employee')?.addEventListener('click', () => {
  document.getElementById('edit-employee-form').reset();
  document.getElementById('edit-employee-modal').classList.add('hidden');
});

document.getElementById('edit-employee-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoading(true);
  const id = document.getElementById('edit-employee-id').value;
  const name = document.getElementById('edit-employee-name').value.trim();
  const email = document.getElementById('edit-employee-email').value.trim();
  const phone = document.getElementById('edit-employee-phone').value.trim();
  const position = document.getElementById('edit-employee-position').value.trim();

  let error = validateName(name);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validateEmail(email);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validatePhone(phone);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validatePosition(position);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }

  const formData = new URLSearchParams({
    action: 'update',
    id,
    name,
    email,
    phone,
    position
  });
  console.log('Edit employee form data:', formData.toString());

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await response.json();
    console.log('Edit employee response:', data);
    toggleLoading(false);
    if (data.status === 'success') {
      document.getElementById('edit-employee-form').reset();
      document.getElementById('edit-employee-modal').classList.add('hidden');
      await loadEmployees();
      showNotification('Success', 'Employee updated successfully!');
    } else {
      showError(data.data || data.message || 'Failed to update employee');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to update employee. Please check your connection.');
    console.error('Error updating employee:', error);
  }
});

async function deleteEmployee(id) {
  showConfirmBox('Are you sure you want to delete this employee?', async () => {
    toggleLoading(true);
    try {
      const formData = new URLSearchParams({
        action: 'delete',
        id
      });
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      const data = await response.json();
      toggleLoading(false);
      if (data.status === 'success') {
        await loadEmployees();
        showNotification('Success', 'Employee deleted successfully!');
      } else {
        showError(data.data || data.message || 'Failed to delete employee');
      }
    } catch (error) {
      toggleLoading(false);
      showError('Failed to delete employee. Please check your connection.');
      console.error('Error deleting employee:', error);
    }
  });
}

function toggleSubmenu(element) {
  const submenu = element.nextElementSibling;
  submenu.classList.toggle('hidden');
}

function toggleDropdown() {
  document.getElementById('dropdown').classList.toggle('hidden');
}

function handleLogout() {
  localStorage.removeItem('name');
}

document.getElementById('profile-item')?.addEventListener('click', () => {
  document.getElementById('modal-user-name').textContent = localStorage.getItem('name') || 'Guest';
  document.getElementById('profile-modal').classList.remove('hidden');
});

document.getElementById('close-modal')?.addEventListener('click', () => {
  document.getElementById('profile-modal').classList.add('hidden');
});

document.querySelectorAll('#menu li[data-key]')?.forEach(item => {
  item.addEventListener('click', (e) => {
    if (e.target.closest('.submenu') || !item.hasAttribute('data-key')) return;
    const page = item.getAttribute('data-key');
    if (page) {
      window.location.href = page;
    }
  });
});

window.onload = () => {
  document.getElementById('user-name').textContent = localStorage.getItem('name') || 'Guest';
  loadEmployees();
};