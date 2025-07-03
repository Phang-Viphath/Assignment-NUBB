const API_URL = 'https://script.google.com/macros/s/AKfycbwrAjXxeijR31g4_RHzBe3gvvlB8wGGRrHQ7QsE2v0U_svPCrK1h8Vr-SUHIoN2rETA/exec';
let allCustomers = [];

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
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return 'Customer ID must contain only letters, numbers, underscores, or hyphens';
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

async function loadCustomers() {
  toggleLoading(true);
  try {
    const response = await fetch(`${API_URL}?action=read`);
    const data = await response.json();
    toggleLoading(false);
    if (data.status === 'success' && Array.isArray(data.data)) {
      allCustomers = data.data;
      renderTable(allCustomers);
    } else {
      showError(data.data || data.message || 'Invalid data format');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to load customers. Please check your connection.');
    console.error('Error loading customers:', error);
  }
}

function renderTable(customers) {
  const tableBody = document.getElementById('customer-table-body');
  tableBody.innerHTML = '';
  if (customers.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-2 text-center text-gray-400 font-sans text-sm">No customers found</td></tr>';
    return;
  }
  customers.forEach(customer => {
    const row = document.createElement('tr');
    row.classList.add('hover:bg-[#252550]', 'transition-all', 'duration-300', 'border-b', 'border-[#00ddeb]');
    row.innerHTML = `
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(customer.id) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(customer.name) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(customer.email) || 'N/A'}</td>
                    <td class="px-4 py-2 font-sans text-sm">${sanitizeInput(customer.phone) || 'N/A'}</td>
                    <td class="px-4 py-2 text-center">
                        <button onclick="openEditModal('${sanitizeInput(customer.id)}', '${sanitizeInput(customer.name)}', '${sanitizeInput(customer.email)}', '${sanitizeInput(customer.phone)}')" 
                            class="bg-[#00ddeb] text-[#1a1a2e] px-2 py-1 rounded-md mr-2 hover:bg-[#00b8c4] transition-all duration-300 shadow-[0_0_10px_rgba(0,221,235,0.5)]">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button onclick="deleteCustomer('${sanitizeInput(customer.id)}')" 
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

document.getElementById('customer-search')?.addEventListener('input', debounce((e) => {
  const query = e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filteredCustomers = allCustomers.filter(customer =>
    (customer.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
    (customer.email || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query)
  );
  renderTable(filteredCustomers);
}, 300));

document.getElementById('add-customer-btn')?.addEventListener('click', () => {
  document.getElementById('add-customer-form').reset();
  document.getElementById('add-customer-modal').classList.remove('hidden');
});

document.getElementById('close-add-customer-modal')?.addEventListener('click', () => {
  document.getElementById('add-customer-form').reset();
  document.getElementById('add-customer-modal').classList.add('hidden');
});

document.getElementById('cancel-add-customer')?.addEventListener('click', () => {
  document.getElementById('add-customer-form').reset();
  document.getElementById('add-customer-modal').classList.add('hidden');
});

document.getElementById('add-customer-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoading(true);
  const id = document.getElementById('add-customer-id').value.trim();
  const name = document.getElementById('add-customer-name').value.trim();
  const email = document.getElementById('add-customer-email').value.trim();
  const phone = document.getElementById('add-customer-phone').value.trim();

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

  try {
    const formData = new URLSearchParams({
      action: 'insert',
      id,
      name,
      email,
      phone
    });
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await response.json();
    toggleLoading(false);
    if (data.status === 'success') {
      document.getElementById('add-customer-form').reset();
      document.getElementById('add-customer-modal').classList.add('hidden');
      await loadCustomers();
      showNotification('Success', 'Customer added successfully!');
    } else {
      showError(data.data || data.message || 'Failed to add customer');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to add customer. Please check your connection.');
    console.error('Error adding customer:', error);
  }
});

function openEditModal(id, name, email, phone) {
  document.getElementById('edit-customer-id').value = id || '';
  document.getElementById('edit-customer-name').value = name === 'N/A' ? '' : name;
  document.getElementById('edit-customer-email').value = email === 'N/A' ? '' : email;
  document.getElementById('edit-customer-phone').value = phone === 'N/A' ? '' : phone;
  document.getElementById('edit-customer-modal').classList.remove('hidden');
}

document.getElementById('close-edit-customer-modal')?.addEventListener('click', () => {
  document.getElementById('edit-customer-form').reset();
  document.getElementById('edit-customer-modal').classList.add('hidden');
});

document.getElementById('cancel-edit-customer')?.addEventListener('click', () => {
  document.getElementById('edit-customer-form').reset();
  document.getElementById('edit-customer-modal').classList.add('hidden');
});

document.getElementById('edit-customer-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoading(true);
  const id = document.getElementById('edit-customer-id').value;
  const name = document.getElementById('edit-customer-name').value.trim();
  const email = document.getElementById('edit-customer-email').value.trim();
  const phone = document.getElementById('edit-customer-phone').value.trim();

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

  const formData = new URLSearchParams({
    action: 'update',
    id,
    name,
    email,
    phone
  });
  console.log('Edit customer form data:', formData.toString());

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await response.json();
    console.log('Edit customer response:', data);
    toggleLoading(false);
    if (data.status === 'success') {
      document.getElementById('edit-customer-form').reset();
      document.getElementById('edit-customer-modal').classList.add('hidden');
      await loadCustomers();
      showNotification('Success', 'Customer updated successfully!');
    } else {
      showError(data.data || data.message || 'Failed to update customer');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to update customer. Please check your connection.');
    console.error('Error updating customer:', error);
  }
});

async function deleteCustomer(id) {
  showConfirmBox('Are you sure you want to delete this customer?', async () => {
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
        await loadCustomers();
        showNotification('Success', 'Customer deleted successfully!');
      } else {
        showError(data.data || data.message || 'Failed to delete customer');
      }
    } catch (error) {
      toggleLoading(false);
      showError('Failed to delete customer. Please check your connection.');
      console.error('Error deleting customer:', error);
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
  loadCustomers();
};