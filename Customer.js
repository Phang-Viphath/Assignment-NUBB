const API_URL = 'https://script.google.com/macros/s/AKfycbwrAjXxeijR31g4_RHzBe3gvvlB8wGGRrHQ7QsE2v0U_svPCrK1h8Vr-SUHIoN2rETA/exec';
let allCustomers = [];

function showNotification(title, message) {
  let notificationBox = document.getElementById('custom-notification-box');
  if (!notificationBox) {
    notificationBox = document.createElement('div');
    notificationBox.id = 'custom-notification-box';
    notificationBox.className = 'fixed bottom-4 right-4 z-[60] w-80 space-y-2';
    document.body.appendChild(notificationBox);
  }

  const icons = {
    Success: 'fas fa-check-circle text-green-500',
    Error: 'fas fa-times-circle text-red-500',
    Info: 'fas fa-info-circle text-blue-500',
    Warning: 'fas fa-exclamation-circle text-yellow-500'
  };

  const notification = document.createElement('div');
  notification.className = `
    bg-white rounded-xl shadow-xl p-4 border-l-4
    ${title === 'Error' ? 'border-red-500' : title === 'Success' ? 'border-green-500' : title === 'Warning' ? 'border-yellow-500' : 'border-blue-500'}
    transform transition-all duration-300 animate-fade-in-up
  `;
  notification.innerHTML = `
    <div class="flex gap-3 items-start">
      <i class="${icons[title] || 'fas fa-bell text-gray-500'} text-2xl mt-1"></i>
      <div class="flex-1">
        <h3 class="text-md font-semibold text-gray-900">${title}</h3>
        <p class="text-sm text-gray-700">${message}</p>
      </div>
      <button class="text-gray-400 hover:text-gray-600 text-sm mt-1" onclick="this.closest('div[role=alert]').remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  notification.setAttribute('role', 'alert');

  notificationBox.appendChild(notification);
  setTimeout(() => {
    notification.classList.add('animate-fade-out-down');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Confirm Box Function
function showConfirmBox(message, onConfirm) {
  let confirmBox = document.getElementById('custom-confirm-box');
  if (!confirmBox) {
    confirmBox = document.createElement('div');
    confirmBox.id = 'custom-confirm-box';
    confirmBox.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[60] p-4';
    confirmBox.setAttribute('aria-modal', 'true');
    confirmBox.setAttribute('role', 'dialog');
    confirmBox.innerHTML = `
      <div class="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm">
        <h3 class="text-xl font-bold mb-4 text-gray-900">Confirm Action</h3>
        <p id="confirm-box-message" class="text-gray-700 mb-6"></p>
        <div class="flex justify-end gap-3">
          <button id="confirm-box-cancel-btn" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">Cancel</button>
          <button id="confirm-box-ok-btn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmBox);
  }

  document.getElementById('confirm-box-message').textContent = message;
  confirmBox.classList.remove('hidden');

  const cancelBtn = document.getElementById('confirm-box-cancel-btn');
  const confirmBtn = document.getElementById('confirm-box-ok-btn');
  const newCancelBtn = cancelBtn.cloneNode(true);
  const newConfirmBtn = confirmBtn.cloneNode(true);
  cancelBtn.replaceWith(newCancelBtn);
  confirmBtn.replaceWith(newConfirmBtn);

  newCancelBtn.addEventListener('click', () => {
    confirmBox.classList.add('hidden');
  });

  newConfirmBtn.addEventListener('click', () => {
    confirmBox.classList.add('hidden');
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  });

  confirmBox.addEventListener('click', (e) => {
    if (e.target === confirmBox) {
      confirmBox.classList.add('hidden');
    }
  });

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      confirmBox.classList.add('hidden');
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

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
    tableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-2 text-center text-gray-600">No customers found</td></tr>';
    return;
  }
  customers.forEach(customer => {
    const row = document.createElement('tr');
    row.classList.add('table-row');
    row.innerHTML = `
      <td class="border px-4 py-2">${sanitizeInput(customer.id) || 'N/A'}</td>
      <td class="border px-4 py-2">${sanitizeInput(customer.name) || 'N/A'}</td>
      <td class="border px-4 py-2">${sanitizeInput(customer.email) || 'N/A'}</td>
      <td class="border px-4 py-2">${sanitizeInput(customer.phone) || 'N/A'}</td>
      <td class="border px-4 py-2 text-center">
        <button onclick="openEditModal('${sanitizeInput(customer.id)}', '${sanitizeInput(customer.name)}', '${sanitizeInput(customer.email)}', '${sanitizeInput(customer.phone)}')" class="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button onclick="deleteCustomer('${sanitizeInput(customer.id)}')" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Debounced Search
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

// Add Customer Modal
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

// Edit Customer Modal
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

  // Validation
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
  window.location.href = 'LoginPage.html';
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