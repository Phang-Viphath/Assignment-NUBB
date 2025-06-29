const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzV7fgCx6mi8rO5V4g_gie4gJtuDAWQ-d0R-vUlBssZMFwtPrEVrOsvGjY60eVSH-3o/exec';
let allBrands = [];

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

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateId(id) {
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return 'Brand ID must contain only letters, numbers, underscores, or hyphens';
  return null;
}

function validateBrandName(name) {
  if (!name || name.length < 2) return 'Brand name must be at least 2 characters long';
  if (name.length > 50) return 'Brand name cannot exceed 50 characters';
  return null;
}

async function loadBrands() {
  toggleLoading(true);
  try {
    const response = await fetch(`${WEB_APP_URL}?action=read`);
    const data = await response.json();
    toggleLoading(false);
    if (data.status === 'success' && Array.isArray(data.data)) {
      allBrands = data.data;
      renderTable(allBrands);
    } else {
      showError(data.data || data.message || 'Invalid data format');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to load brands. Please check your connection.');
    console.error('Error loading brands:', error);
  }
}

function renderTable(brands) {
  const tableBody = document.getElementById('brand-table-body');
  tableBody.innerHTML = '';
  brands.forEach(brand => {
    const rowElement = document.createElement('tr');
    rowElement.classList.add('table-row', 'border-t');
    const imageUrl = brand.image && isValidUrl(brand.image) ? brand.image : 'https://github.com/Phang-Viphath/Image/blob/main/Brand/brand%20name.png?raw=true';
    rowElement.innerHTML = `
      <td class="px-4 py-3 text-gray-800">${sanitizeInput(brand.id) || 'N/A'}</td>
      <td class="px-4 py-3">
        <img src="${imageUrl}" alt="Brand Logo" class="w-10 h-10 rounded-full" onerror="this.src='https://github.com/Phang-Viphath/Image/blob/main/Brand/brand%20name.png?raw=true'">
      </td>
      <td class="px-4 py-3 text-gray-800">${sanitizeInput(brand.brand) || 'N/A'}</td>
      <td class="px-4 py-3 text-gray-600">${sanitizeInput(brand.description) || 'No description'}</td>
      <td class="px-4 py-3 text-center">
        <button onclick="openEditModal('${sanitizeInput(brand.id)}', '${sanitizeInput(brand.image)}', '${sanitizeInput(brand.brand)}', '${sanitizeInput(brand.description)}')" class="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"><i class="fa-solid fa-edit"></i></button>
        <button onclick="deleteBrand('${sanitizeInput(brand.id)}')" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tableBody.appendChild(rowElement);
  });
}
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

document.getElementById('search-input').addEventListener('input', debounce((e) => {
  const query = e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filteredBrands = allBrands.filter(brand =>
    (brand.brand || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
    (brand.description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query)
  );
  renderTable(filteredBrands);
}, 300));
document.getElementById('open-brand-modal').addEventListener('click', () => {
  document.getElementById('add-brand-form').reset();
  document.getElementById('add-brand-modal').classList.remove('hidden');
});

document.getElementById('close-brand-modal').addEventListener('click', () => {
  document.getElementById('add-brand-form').reset();
  document.getElementById('add-brand-modal').classList.add('hidden');
});

document.getElementById('cancel-brand').addEventListener('click', () => {
  document.getElementById('add-brand-form').reset();
  document.getElementById('add-brand-modal').classList.add('hidden');
});

document.getElementById('add-brand-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoading(true);
  const id = document.getElementById('brand-id').value.trim();
  const brand = document.getElementById('brand-name').value.trim();
  const image = document.getElementById('brand-logo').value.trim();
  const description = document.getElementById('brand-description').value.trim();

  let error = validateId(id);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validateBrandName(brand);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  if (image && !isValidUrl(image)) {
    toggleLoading(false);
    showError('Invalid logo URL');
    return;
  }

  try {
    const formData = new URLSearchParams({
      action: 'insert',
      id,
      image,
      brand,
      description
    });
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await response.json();
    toggleLoading(false);
    if (data.status === 'success') {
      document.getElementById('add-brand-form').reset();
      document.getElementById('add-brand-modal').classList.add('hidden');
      await loadBrands();
      showNotification('Success', 'Brand added successfully!');
    } else {
      showError(data.data || data.message || 'Failed to add brand');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to add brand. Please check your connection.');
    console.error('Error adding brand:', error);
  }
});

function openEditModal(id, image, brand, description) {
  document.getElementById('edit-brand-id').value = id || 'N/A';
  document.getElementById('edit-brand-name').value = brand === 'N/A' ? '' : brand;
  document.getElementById('edit-brand-logo').value = image || '';
  document.getElementById('edit-brand-description').value = description === 'No description' ? '' : description;
  document.getElementById('edit-brand-modal').classList.remove('hidden');
}

document.getElementById('close-edit-brand-modal').addEventListener('click', () => {
  document.getElementById('edit-brand-form').reset();
  document.getElementById('edit-brand-modal').classList.add('hidden');
});

document.getElementById('cancel-edit-brand').addEventListener('click', () => {
  document.getElementById('edit-brand-form').reset();
  document.getElementById('edit-brand-modal').classList.add('hidden');
});

document.getElementById('edit-brand-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoading(true);
  const id = document.getElementById('edit-brand-id').value;
  const brand = document.getElementById('edit-brand-name').value.trim();
  const image = document.getElementById('edit-brand-logo').value.trim();
  const description = document.getElementById('edit-brand-description').value.trim();

  let error = validateBrandName(brand);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  if (image && !isValidUrl(image)) {
    toggleLoading(false);
    showError('Invalid logo URL');
    return;
  }

  try {
    const formData = new URLSearchParams({
      action: 'update',
      id,
      image,
      brand,
      description
    });
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await response.json();
    toggleLoading(false);
    if (data.status === 'success') {
      document.getElementById('edit-brand-form').reset();
      document.getElementById('edit-brand-modal').classList.add('hidden');
      await loadBrands();
      showNotification('Success', 'Brand updated successfully!');
    } else {
      showError(data.data || data.message || 'Failed to update brand');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to update brand. Please check your connection.');
    console.error('Error updating brand:', error);
  }
});

async function deleteBrand(id) {
  showConfirmBox('Are you sure you want to delete this brand?', async () => {
    toggleLoading(true);
    try {
      const formData = new URLSearchParams({
        action: 'delete',
        id
      });
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      const data = await response.json();
      toggleLoading(false);
      if (data.status === 'success') {
        await loadBrands();
        showNotification('Success', 'Brand deleted successfully!');
      } else {
        showError(data.data || data.message || 'Failed to delete brand');
      }
    } catch (error) {
      toggleLoading(false);
      showError('Failed to delete brand. Please check your connection.');
      console.error('Error deleting brand:', error);
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

document.getElementById('profile-item').addEventListener('click', () => {
  document.getElementById('modal-user-name').textContent = localStorage.getItem('name') || 'Guest';
  document.getElementById('profile-modal').classList.remove('hidden');
});

document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('profile-modal').classList.add('hidden');
});

document.querySelectorAll('#menu li[data-key]').forEach(item => {
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
  loadBrands();
};