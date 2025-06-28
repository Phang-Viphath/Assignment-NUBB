const CATEGORY_APIS = {
  espresso: 'https://script.google.com/macros/s/AKfycby8X3puhrKZpOhxWV8cxlKxWCIfOLHZM8xKBgvgT9aVKTjrhRUaG1ZSiEy5M77VIUfT/exec',
  iced: 'https://script.google.com/macros/s/AKfycbxMk08YTKVM8HDk9QlqLlrTHFz_SVFIPKkPkltazwfyShWEgSUt4fNr7UR-vkZJ3WyY/exec',
  non_coffee: 'https://script.google.com/macros/s/AKfycbxdGP8WVpFDtPvPgk-tqxO86-50i7qcXZhbf1WFZEdooMT2jK2intUW5pY_oKhTXoh7/exec',
  pastries: 'https://script.google.com/macros/s/AKfycbxtq7rJQOLaUenHGcCc3zPzAeHQnDigUZFYSezCA9R0Ci21lJ7tg5_iCAbltYLQgQKvVA/exec'
};

const CATEGORY_NAMES = {
  espresso: 'Espresso-Based Drinks',
  iced: 'Iced Coffee & Cold Brews',
  non_coffee: 'Non-Coffee Drinks',
  pastries: 'Pastries & Snacks'
};

let allCategories = [];
let currentCategoryType = 'espresso';

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

function sanitizeUrl(url) {
  if (typeof url !== 'string') return url || '';
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '';
  try {
    new URL(trimmedUrl);
    return trimmedUrl;
  } catch {
    return '';
  }
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateCategoryName(name) {
  if (!name || name.length < 2) return 'Product name must be at least 2 characters long';
  if (name.length > 50) return 'Product name cannot exceed 50 characters';
  return null;
}

function validateId(id) {
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return 'Product ID must contain only letters, numbers, underscores, or hyphens';
  return null;
}

function validateSizes(sizes) {
  if (!sizes) return 'Sizes are required (e.g., S,M,L)';
  return null;
}

function validatePrice(price) {
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) return 'Please enter a valid non-negative price';
  return null;
}

function validateBrand(brand) {
  if (!brand) return 'Brand name is required';
  return null;
}

function validateCategory(category) {
  if (!category) return 'Category is required';
  return null;
}

async function loadCategories(categoryType) {
  toggleLoading(true);
  try {
    const apiUrl = CATEGORY_APIS[categoryType] || CATEGORY_APIS.espresso;
    const response = await fetch(`${apiUrl}?action=read`);
    const data = await response.json();
    toggleLoading(false);
    if (data.status === 'success' && Array.isArray(data.data)) {
      allCategories = data.data.map(item => ({
        ...item,
        CategoryType: categoryType,
        LastModified: item.LastModified || new Date().toISOString()
      }));
      renderTable(allCategories);
    } else {
      showError(data.message || 'Invalid data format');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to load products. Please check your connection.');
    console.error('Error loading products:', error);
  }
}

function renderTable(categories) {
  const tableBody = document.getElementById('category-table-body');
  tableBody.innerHTML = '';
  categories.forEach(category => {
    const rowElement = document.createElement('tr');
    rowElement.classList.add('table-row', 'border-t');
    rowElement.setAttribute('data-last-modified', category.LastModified || '');
    rowElement.setAttribute('data-category-type', category.CategoryType || '');
    const imageUrl = category.Image && isValidUrl(category.Image) ? category.Image : 'https://via.placeholder.com/50';
    rowElement.innerHTML = `
      <td class="px-4 py-3 text-gray-800">${sanitizeInput(category.Id) || 'N/A'}</td>
      <td class="px-4 py-3 text-gray-800">
        <img src="${imageUrl}" alt="${sanitizeInput(category.Name) || 'Product Image'}" class="w-12 h-12 rounded-full shadow-md">
      </td>
      <td class="px-4 py-3 text-gray-800">${sanitizeInput(category.Name) || 'N/A'}</td>
      <td class="px-4 py-3 text-gray-800">${sanitizeInput(category.Sizes) || 'N/A'}</td>
      <td class="px-4 py-3 text-gray-800">$${parseFloat(category.Price || 0).toFixed(2)}</td>
      <td class="px-4 py-3 text-gray-600">${sanitizeInput(category.Description) || 'No description'}</td>
      <td class="px-4 py-3 text-gray-800">${sanitizeInput(category.Brand) || 'N/A'}</td>
      <td class="px-4 py-3 text-center">
        <button onclick="openEditModal('${sanitizeInput(category.Id)}', '${sanitizeInput(category.Name)}', '${sanitizeInput(category.Category)}', '${sanitizeInput(category.Sizes)}', '${category.Price || 0}', '${sanitizeInput(category.Description)}', '${sanitizeInput(category.Brand)}', '${sanitizeUrl(category.Image)}', '${sanitizeInput(category.LastModified)}', '${sanitizeInput(category.CategoryType)}')" class="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"><i class="fa-solid fa-edit"></i></button>
        <button onclick="deleteCategory('${sanitizeInput(category.Id)}', '${sanitizeInput(category.CategoryType)}')" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"><i class="fa-solid fa-trash"></i></button>
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
  const filteredCategories = allCategories.filter(category =>
    (category.Name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
    (category.Description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
    (category.Category || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query) ||
    (category.Brand || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query)
  );
  renderTable(filteredCategories);
}, 300));

document.getElementById('category-select').addEventListener('change', (e) => {
  currentCategoryType = e.target.value;
  loadCategories(currentCategoryType);
});

document.getElementById('open-category-modal').addEventListener('click', () => {
  document.getElementById('category-type').value = currentCategoryType;
  document.getElementById('category-category').value = CATEGORY_NAMES[currentCategoryType];
  document.getElementById('add-category-modal').classList.remove('hidden');
});

document.getElementById('close-category-modal').addEventListener('click', () => {
  document.getElementById('add-category-form').reset();
  document.getElementById('add-category-modal').classList.add('hidden');
});

document.getElementById('cancel-category').addEventListener('click', () => {
  document.getElementById('add-category-form').reset();
  document.getElementById('add-category-modal').classList.add('hidden');
});

document.getElementById('add-category-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoading(true);
  const categoryType = document.getElementById('category-type').value;
  const id = document.getElementById('category-id').value.trim();
  const name = document.getElementById('category-name').value.trim();
  const category = document.getElementById('category-category').value.trim();
  const sizes = document.getElementById('category-sizes').value.trim();
  const price = document.getElementById('category-price').value;
  const description = document.getElementById('category-description').value.trim();
  const brand = document.getElementById('category-brand').value.trim();
  const image = document.getElementById('category-image').value.trim();

  let error = validateId(id);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validateCategoryName(name);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validateCategory(category);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validateSizes(sizes);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validatePrice(price);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validateBrand(brand);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  if (image && !isValidUrl(image)) {
    toggleLoading(false);
    showError('Please enter a valid image URL');
    return;
  }

  try {
    const apiUrl = CATEGORY_APIS[categoryType];
    const formData = new URLSearchParams({
      action: 'insert',
      id,
      Name: name,
      Category: category,
      Sizes: sizes,
      Price: parseFloat(price),
      Description: description,
      Brand: brand,
      Image: image
    });
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await response.json();
    toggleLoading(false);
    if (data.status === 'success') {
      document.getElementById('add-category-form').reset();
      document.getElementById('add-category-modal').classList.add('hidden');
      await loadCategories(currentCategoryType);
      showNotification('Success', 'Product added successfully!');
    } else {
      showError(data.data || data.message || 'Failed to add product');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to add product. Please check your connection.');
    console.error('Error adding product:', error);
  }
});

function openEditModal(id, name, category, sizes, price, description, brand, image, lastModified, categoryType) {
  document.getElementById('edit-category-id').value = id || 'N/A';
  document.getElementById('edit-category-type').value = categoryType || currentCategoryType;
  document.getElementById('edit-category-name').value = name === 'N/A' ? '' : name;
  document.getElementById('edit-category-category').value = category === 'N/A' ? '' : category;
  document.getElementById('edit-category-sizes').value = sizes === 'N/A' ? '' : sizes;
  document.getElementById('edit-category-price').value = parseFloat(price) || 0;
  document.getElementById('edit-category-description').value = description === 'No description' ? '' : description;
  document.getElementById('edit-category-brand').value = brand === 'N/A' ? '' : brand;
  document.getElementById('edit-category-image').value = image || '';
  document.getElementById('edit-category-form').setAttribute('data-last-modified', lastModified || '');
  document.getElementById('edit-category-modal').classList.remove('hidden');
}

document.getElementById('close-edit-category-modal').addEventListener('click', () => {
  document.getElementById('edit-category-form').reset();
  document.getElementById('edit-category-modal').classList.add('hidden');
});

document.getElementById('cancel-edit-category').addEventListener('click', () => {
  document.getElementById('edit-category-form').reset();
  document.getElementById('edit-category-modal').classList.add('hidden');
});

document.getElementById('edit-category-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoading(true);
  const categoryType = document.getElementById('edit-category-type').value;
  const id = document.getElementById('edit-category-id').value;
  const lastModified = document.getElementById('edit-category-form').getAttribute('data-last-modified');
  const name = document.getElementById('edit-category-name').value.trim();
  const category = document.getElementById('edit-category-category').value.trim();
  const sizes = document.getElementById('edit-category-sizes').value.trim();
  const price = document.getElementById('edit-category-price').value;
  const description = document.getElementById('edit-category-description').value.trim();
  const brand = document.getElementById('edit-category-brand').value.trim();
  const image = document.getElementById('edit-category-image').value.trim();

  let error = validateCategoryName(name);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validateCategory(category);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validateSizes(sizes);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validatePrice(price);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  error = validateBrand(brand);
  if (error) {
    toggleLoading(false);
    showError(error);
    return;
  }
  if (image && !isValidUrl(image)) {
    toggleLoading(false);
    showError('Please enter a valid image URL');
    return;
  }

  try {
    const apiUrl = CATEGORY_APIS[categoryType];
    const formData = new URLSearchParams({
      action: 'update',
      id,
      Name: name,
      Category: category,
      Sizes: sizes,
      Price: parseFloat(price),
      Description: description,
      Brand: brand,
      Image: image,
      LastModified: lastModified
    });
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await response.json();
    toggleLoading(false);
    if (data.status === 'success') {
      document.getElementById('edit-category-form').reset();
      document.getElementById('edit-category-modal').classList.add('hidden');
      await loadCategories(currentCategoryType);
      showNotification('Success', 'Product updated successfully!');
    } else {
      showError(data.data || data.message || 'Failed to update product');
    }
  } catch (error) {
    toggleLoading(false);
    showError('Failed to update product. Please check your connection.');
    console.error('Error updating product:', error);
  }
});

async function deleteCategory(id, categoryType) {
  showConfirmBox('Are you sure you want to delete this product?', async () => {
    toggleLoading(true);
    try {
      const apiUrl = CATEGORY_APIS[categoryType];
      const formData = new URLSearchParams({
        action: 'delete',
        id
      });
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      const data = await response.json();
      toggleLoading(false);
      if (data.status === 'success') {
        await loadCategories(currentCategoryType);
        showNotification('Success', 'Product deleted successfully!');
      } else {
        showError(data.data || data.message || 'Failed to delete product');
      }
    } catch (error) {
      toggleLoading(false);
      showError('Failed to delete product. Please check your connection.');
      console.error('Error deleting product:', error);
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

function setupNavigation() {
  document.querySelectorAll('#menu li[data-key]').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.submenu') || !item.hasAttribute('data-key')) return;
      const page = item.getAttribute('data-key');
      if (page) {
        window.location.href = page;
      }
    });
  });
}

window.onload = () => {
  document.getElementById('user-name').textContent = localStorage.getItem('name') || 'Guest';
  document.getElementById('modal-user-name').textContent = localStorage.getItem('name') || 'Guest';
  setupNavigation();
  loadCategories(currentCategoryType);
};

document.getElementById('profile-item').addEventListener('click', () => {
  document.getElementById('profile-modal').classList.remove('hidden');
});

document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('profile-modal').classList.add('hidden');
});