const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzV7fgCx6mi8rO5V4g_gie4gJtuDAWQ-d0R-vUlBssZMFwtPrEVrOsvGjY60eVSH-3o/exec';
let allBrands = [];

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
    rowElement.classList.add('border-b', 'border-[#00ddeb]', 'hover:bg-[#252550]', 'transition-all', 'duration-300');
    const imageUrl = brand.image && isValidUrl(brand.image) ? brand.image : 'https://via.placeholder.com/40';
    rowElement.innerHTML = `
                    <td class="px-4 py-3 font-sans text-sm text-gray-200">${sanitizeInput(brand.id) || 'N/A'}</td>
                    <td class="px-4 py-3">
                        <img src="${imageUrl}" alt="Brand Logo" class="w-10 h-10 rounded-full object-cover" onerror="this.src='https://via.placeholder.com/40'">
                    </td>
                    <td class="px-4 py-3 font-sans text-sm text-gray-200">${sanitizeInput(brand.brand) || 'N/A'}</td>
                    <td class="px-4 py-3 font-sans text-sm text-gray-300">${sanitizeInput(brand.description) || 'No description'}</td>
                    <td class="px-4 py-3 text-center">
                        <button onclick="openEditModal('${sanitizeInput(brand.id)}', '${sanitizeInput(brand.image)}', '${sanitizeInput(brand.brand)}', '${sanitizeInput(brand.description)}')" 
                            class="bg-[#00ddeb] text-[#1a1a2e] px-2 py-1 rounded-md mr-2 hover:bg-[#00b8c4] transition-all duration-300 shadow-[0_0_10px_rgba(0,221,235,0.5)]">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button onclick="deleteBrand('${sanitizeInput(brand.id)}')" 
                            class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-all duration-300 shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                            <i class="fa-solid fa-trash"></i>
                        </button>
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
  toggleLoadingadd(true);
  const id = document.getElementById('brand-id').value.trim();
  const brand = document.getElementById('brand-name').value.trim();
  const image = document.getElementById('brand-logo').value.trim();
  const description = document.getElementById('brand-description').value.trim();

  let error = validateId(id);
  if (error) {
    toggleLoadingadd(false);
    showError(error);
    return;
  }
  error = validateBrandName(brand);
  if (error) {
    toggleLoadingadd(false);
    showError(error);
    return;
  }
  if (image && !isValidUrl(image)) {
    toggleLoadingadd(false);
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
    toggleLoadingadd(false);
    if (data.status === 'success') {
      document.getElementById('add-brand-form').reset();
      document.getElementById('add-brand-modal').classList.add('hidden');
      await loadBrands();
      showNotification('Success', 'Brand added successfully!');
    } else {
      showError(data.data || data.message || 'Failed to add brand');
    }
  } catch (error) {
    toggleLoadingadd(false);
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
  toggleLoadingedit(true);
  const id = document.getElementById('edit-brand-id').value;
  const brand = document.getElementById('edit-brand-name').value.trim();
  const image = document.getElementById('edit-brand-logo').value.trim();
  const description = document.getElementById('edit-brand-description').value.trim();

  let error = validateBrandName(brand);
  if (error) {
    toggleLoadingedit(false);
    showError(error);
    return;
  }
  if (image && !isValidUrl(image)) {
    toggleLoadingedit(false);
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
    toggleLoadingedit(false);
    if (data.status === 'success') {
      document.getElementById('edit-brand-form').reset();
      document.getElementById('edit-brand-modal').classList.add('hidden');
      await loadBrands();
      showNotification('Success', 'Brand updated successfully!');
    } else {
      showError(data.data || data.message || 'Failed to update brand');
    }
  } catch (error) {
    toggleLoadingedit(false);
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

loadBrands();