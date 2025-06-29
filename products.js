const CATEGORIES = {
  espresso: {
    api: 'https://script.google.com/macros/s/AKfycby8X3puhrKZpOhxWV8cxlKxWCIfOLHZM8xKBgvgT9aVKTjrhRUaG1ZSiEy5M77VIUfT/exec',
    name: 'Espresso-Based Drinks'
  },
  iced: {
    api: 'https://script.google.com/macros/s/AKfycbxMk08YTKVM8HDk9QlqLlrTHFz_SVFIPKkPkltazwfyShWEgSUt4fNr7UR-vkZJ3WyY/exec',
    name: 'Iced Coffee & Cold Brews'
  },
  non_coffee: {
    api: 'https://script.google.com/macros/s/AKfycbxdGP8WVpFDtPvPgk-tqxO86-50i7qcXZhbf1WFZEdooMT2jK2intUW5pY_oKhTXoh7/exec',
    name: 'Non-Coffee Drinks'
  },
  pastries: {
    api: 'https://script.google.com/macros/s/AKfycbxtq7rJQOLaUenHGcCc3zPzAeHQnDigUZFYSezCA9R0Ci21lJ7tg5_iCAbltYLQgQKvVA/exec',
    name: 'Pastries & Snacks'
  }
};

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const productCache = new Map();

function toggleLoading(show) {
  document.getElementById('product-loading').classList.toggle('hidden', !show);
  document.getElementById('product-error').classList.add('hidden');
  document.getElementById('product-list').classList.toggle('hidden', show);
}

function showError(message) {
  document.getElementById('product-loading').classList.add('hidden');
  document.getElementById('product-error').classList.remove('hidden');
  document.getElementById('product-error').querySelector('p').textContent = `Failed to load products: ${message}`;
  document.getElementById('product-list').classList.add('hidden');
}

function showNotification(title, message) {
  let notificationBox = document.getElementById('custom-notification-box');
  if (!notificationBox) {
    notificationBox = document.createElement('div');
    notificationBox.id = 'custom-notification-box';
    notificationBox.className = 'fixed bottom-4 right-4 z-50 w-80 space-y-2';
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
    confirmBox.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4 hidden';
    confirmBox.innerHTML = `
      <div class="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm">
        <h3 class="text-xl font-bold mb-4 text-gray-900">Confirm Action</h3>
        <p id="confirm-box-message" class="text-gray-700 mb-6"></p>
        <div class="flex justify-end gap-3">
          <button id="confirm-box-cancel-btn" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-blue-500 focus:ring-2 transition-colors">Cancel</button>
          <button id="confirm-box-ok-btn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-blue-500 focus:ring-2 transition-colors">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmBox);
  }
  document.getElementById('confirm-box-message').textContent = message;
  confirmBox.classList.remove('hidden');

  const cancelBtn = document.getElementById('confirm-box-cancel-btn');
  const okBtn = document.getElementById('confirm-box-ok-btn');
  const newCancelBtn = cancelBtn.cloneNode(true);
  const newOkBtn = okBtn.cloneNode(true);
  cancelBtn.replaceWith(newCancelBtn);
  okBtn.replaceWith(newOkBtn);

  newCancelBtn.onclick = () => confirmBox.classList.add('hidden');
  newOkBtn.onclick = () => {
    confirmBox.classList.add('hidden');
    onConfirm();
  };
}

function validateProducts(productData, category) {
  if (!productData || productData.length === 0) {
    console.warn(`No products found in response for category: ${category}`);
    return false;
  }
  const requiredFields = ['Id', 'Name', 'Category', 'Sizes', 'Price', 'Description', 'Brand', 'Image'];
  let hasImageIssues = false;
  for (let item of productData) {
    for (let field of requiredFields) {
      if (!(field in item) || item[field] === undefined || item[field] === null) {
        console.error(`Error: Missing or invalid field '${field}' in product '${item.Name || 'Unknown'}' for category '${category}'`);
        return false;
      }
    }
    if (!Number.isInteger(parseInt(item.Id))) {
      console.error(`Error: Invalid Id format for '${item.Name}' in category '${category}'`);
      return false;
    }
    if (isNaN(parseFloat(item.Price)) || parseFloat(item.Price) < 0) {
      console.error(`Error: Invalid Price format for '${item.Name}' in category '${category}'`);
      return false;
    }
    if (!Object.values(CATEGORIES).some(cat => cat.name === item.Category)) {
      console.error(`Error: Invalid Category '${item.Category}' for '${item.Name}' in category '${category}'`);
      return false;
    }
    if (!item['Image']) {
      console.warn(`Warning: Empty Image URL for '${item.Name}' in category '${category}'`);
      hasImageIssues = true;
    } else if (!isValidUrl(item['Image'])) {
      console.warn(`Warning: Invalid Image URL '${item['Image']}' for '${item.Name}' in category '${category}'`);
      hasImageIssues = true;
    }
  }
  const ids = productData.map(item => item.Id);
  if (ids.length !== new Set(ids).size) {
    console.error(`Error: Duplicate IDs found in products for category '${category}'`);
    return false;
  }
  if (hasImageIssues) {
    showNotification('Warning', `Some products in ${CATEGORIES[category].name} have invalid or missing image URLs. Update Google Sheets with direct image links (e.g., from a CDN or correct raw URLs).`);
  }
  console.log(`Product data validated successfully for category '${category}'!`);
  return true;
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

function sanitizeUrl(url) {
  if (typeof url !== 'string') return url;
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '';
  try {
    new URL(trimmedUrl);
    return trimmedUrl;
  } catch {
    return '';
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function validateCart() {
  cart = cart.filter(item => {
    const product = products.find(p => p.Id == item.Id);
    if (!product) {
      console.warn(`Removing cart item with ID ${item.Id} as it no longer exists`);
      return false;
    }
    return true;
  });
  saveCart();
}

function updateCartBadge() {
  const cartBadge = document.querySelector('#cartBtn span');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
}

function handleImageError(imgElement, productName, imageUrl) {
  console.error(`Image failed to load for product '${productName}' with URL: ${imageUrl}`);
  imgElement.src = 'https://placehold.co/240x192?text=No+Image';
  imgElement.alt = 'No Image';
}

function updateCartDisplay() {
  const cartItemsElement = document.getElementById('cartItems');
  const cartSubtotalElement = document.getElementById('cartSubtotal');
  const cartTotalElement = document.getElementById('cartTotal');

  if (cart.length === 0) {
    cartItemsElement.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-8">Your cart is empty</p>';
    cartSubtotalElement.textContent = '$0.00';
    cartTotalElement.textContent = '$0.00';
  } else {
    cartItemsElement.innerHTML = cart.map((item, index) => {
      const imageUrl = item['Image'] && isValidUrl(item['Image']) ? sanitizeInput(item['Image']) : 'https://placehold.co/48x48?text=No+Image';
      console.log(`Rendering cart item '${item.Name}' with Image URL: ${imageUrl}`);
      return `
        <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <img src="${imageUrl}" alt="${sanitizeInput(item.Name)}" class="w-12 h-12 object-cover rounded-md" onerror="handleImageError(this, '${sanitizeInput(item.Name)}', '${imageUrl}')">
            <div>
              <p class="text-gray-800 dark:text-white font-medium">${sanitizeInput(item.Name)}</p>
              <p class="text-gray-500 dark:text-gray-400 text-sm">$${parseFloat(item.Price).toFixed(2)}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="decrease-qty-btn text-gray-500 hover:text-gray-700" data-index="${index}" aria-label="Decrease quantity">-</button>
            <span class="text-gray-800 dark:text-white">${item.quantity}</span>
            <button class="increase-qty-btn text-gray-500 hover:text-gray-700" data-index="${index}" aria-label="Increase quantity">+</button>
            <button class="remove-item-btn text-red-500 hover:text-red-700" data-index="${index}" aria-label="Remove item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    const subtotal = cart.reduce((sum, item) => sum + item.quantity * parseFloat(item.Price), 0);
    cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalElement.textContent = `$${subtotal.toFixed(2)}`;
  }
  updateCartBadge();
}

function addToCart(id) {
  const product = products.find(item => item.Id == id);
  if (!product) {
    showNotification('Error', `Product with ID ${id} not found`);
    return;
  }

  const cartItem = cart.find(item => item.Id == id);
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartDisplay();
  showNotification('Success', `${sanitizeInput(product.Name)} added to cart`);
}

function handleQuantityChange(index, change) {
  if (change === 'increase') {
    cart[index].quantity += 1;
  } else if (change === 'decrease') {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    } else {
      cart.splice(index, 1);
    }
  }
  saveCart();
  updateCartDisplay();
}

function removeFromCart(index) {
  const itemName = sanitizeInput(cart[index].Name);
  cart.splice(index, 1);
  saveCart();
  updateCartDisplay();
  showNotification('Success', `${itemName} removed from cart`);
}

function checkoutCart() {
  if (cart.length === 0) {
    showNotification('Error', 'Your cart is empty');
    return;
  }

  showConfirmBox('Are you sure you want to checkout?', () => {
    cart = [];
    saveCart();
    updateCartDisplay();
    closeCartModal();
    showNotification('Success', 'Checkout completed successfully');
  });
}

function printCart() {
  if (cart.length === 0) {
    showNotification('Error', 'Your cart is empty');
    return;
  }

  const printWindow = window.open('', '_blank');
  const today = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Phnom_Penh', hour: '2-digit', minute: '2-digit' });

  const cartItemsHtml = cart.map(item => {
    const imageUrl = item.Image && isValidUrl(item.Image) ? sanitizeInput(item.Image) : 'https://placehold.co/40x40?text=No+Image';
    console.log(`Cart item: ${item.Name}, Image URL: ${imageUrl}`);
    return `
      <tr>
        <td>${sanitizeInput(item.Name)}</td>
        <td>${item.quantity}</td>
        <td>$${parseFloat(item.Price).toFixed(2)}</td>
        <td>$${(item.quantity * parseFloat(item.Price)).toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * parseFloat(item.Price), 0);

  printWindow.document.write(`
    <html>
      <head>
        <title>Cart Receipt - Café Code</title>
        <link href="https://cdn.tailwindcss.com" rel="stylesheet">
        <style>
          body { font-family: Arial, sans-serif;}
          .container { max-width: 900px; margin: 0 auto; }
          .header { text-align: center; display: flex; flex-direction: column; align-items: center; }
          .header h1 { font-size: 18px; font-weight: bold; color: #1a202c; }
          .header p { font-size: 14px; color: #4a5568; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; }
          img { border-radius: 50%; max-width: 90px; max-height: 90px; }
          .footer { text-align: center; margin-top: 10px; color: #6b7280; font-size: 14px; }
          @media print {
            img { display: block; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            table { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://github.com/Phang-Viphath/Image/blob/main/Brand/brand%20name.png?raw=true" alt="Café Code Logo" onerror="this.src='https://placehold.co/100x100?text=Logo';this.alt='No Logo';">
            <h1>Café Code</h1>
            <p>Date: ${today}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${cartItemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Total:</td>
                <td>$${subtotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <div class="footer">Wifi Name: Café Code</div>
          <div class="footer">Password: CafeCode9999</div>
          <div class="footer">Thank you for your purchase at Café Code!</div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 300);
}


function checkoutNow() {
  if (cart.length === 0) {
    showNotification('Error', 'Your cart is empty');
    return;
  }

  showConfirmBox('Proceed with immediate checkout?', () => {
    cart = [];
    saveCart();
    updateCartDisplay();
    closeCartModal();
    showNotification('Success', 'Immediate checkout completed. Redirecting to payment...');
  });
}

function renderProducts(productList) {
  const productListElement = document.getElementById('product-list');
  productListElement.innerHTML = '';
  if (productList.length === 0) {
    productListElement.innerHTML = '<p class="text-center text-gray-600 col-span-4">No products found. Add a product to get started.</p>';
    return;
  }
  let hasMissingImages = false;
  productListElement.innerHTML = productList.map(item => {
    const imageUrl = item['Image'] && isValidUrl(item['Image']) ? sanitizeInput(item['Image']) : 'https://placehold.co/240x192?text=No+Image';
    if (!item['Image'] || !isValidUrl(item['Image'])) {
      hasMissingImages = true;
    }

    const img = new Image();
    img.src = imageUrl;
    console.log(`Rendering product '${item.Name}' with Image URL: ${imageUrl}`);
    return `
      <div class="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 flex flex-col gap-4 border border-gray-100 hover:border-gray-200">
        <div class="relative w-full h-56 rounded-lg overflow-hidden">
          <img src="${imageUrl}" alt="${sanitizeInput(item.Name)}" class="w-full h-full object-cover" loading="lazy" onerror="handleImageError(this, '${sanitizeInput(item.Name)}', '${imageUrl}')">
        </div>
        <div class="flex flex-col flex-grow">
          <h3 class="text-xl font-bold text-gray-900 truncate">${sanitizeInput(item.Name)}</h3>
          <div class="mt-2 space-y-1">
            <p class="text-sm text-gray-500"><span class="font-semibold text-gray-700">Sizes:</span> ${sanitizeInput(item.Sizes) || 'N/A'}</p>
            <p class="text-sm text-gray-500"><span class="font-semibold text-gray-700">Price:</span> $${parseFloat(item.Price).toFixed(2)}</p>
          </div>
        </div>
        <div class="flex justify-around mt-auto">
          <button class="edit-btn flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 transition-colors duration-200" data-id="${item.Id}" aria-label="Edit product ${item.Name}">
            <i class="fa-solid fa-edit text-base"></i>
          </button>
          <button class="view-btn flex items-center gap-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 hover:text-yellow-800 transition-colors duration-200" data-id="${item.Id}" aria-label="View product ${item.Name}">
            <i class="fa-solid fa-eye text-base"></i>
          </button>
          <button class="add-to-cart-btn flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 hover:text-green-800 transition-colors duration-200" data-id="${item.Id}" aria-label="Add ${item.Name} to cart">
            <i class="fas fa-shopping-cart text-base"></i>
          </button>
          <button class="delete-btn flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:text-red-800 transition-colors duration-200" data-id="${item.Id}" aria-label="Delete product ${item.Name}">
            <i class="fa-solid fa-trash-alt text-base"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (hasMissingImages) {
    showNotification('Warning', 'Some products have missing or invalid image URLs. Update Google Sheets with direct image links.');
  }
}

function searchProduct(id, category, callback) {
  const cacheKey = `${category}:${id}`;
  if (productCache.has(cacheKey)) {
    console.log(`Using cached product data for id: ${id} in category: ${category}`);
    callback(productCache.get(cacheKey));
    return;
  }

  const apiUrl = CATEGORIES[category].api;
  console.log(`Searching for id: ${id} in category: ${category}`);
  toggleLoading(true);
  fetch(`${apiUrl}?action=search&id=${encodeURIComponent(id)}`, { cache: 'default' })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(result => {
      toggleLoading(false);
      console.log('Search response:', result);
      if (result.status === 'success') {
        productCache.set(cacheKey, result.data);
        callback(result.data);
      } else {
        throw new Error(result.message || 'Product not found');
      }
    })
    .catch(error => {
      toggleLoading(false);
      console.error(`Search error for id ${id}: ${error.message}`);
      showNotification('Error', `Failed to fetch product: ${error.message}`);
    });
}

function renderViewModal(product) {
  const modal = document.getElementById('view-product-modal');
  if (!modal) {
    console.error('View product modal not found');
    showNotification('Error', 'View product modal is missing in the DOM');
    return;
  }
  const imageUrl = product['Image'] && isValidUrl(product['Image']) ? sanitizeInput(product['Image']) : 'https://placehold.co/240x192?text=No+Image';

  modal.innerHTML = `
    <div class="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md mx-auto">
      <button id="close-view-product-modal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h3 class="text-2xl font-bold mb-5 text-gray-900 text-center">Product Details</h3>
      <div class="flex justify-center mb-5">
        <img 
          id="view-product-image" 
          src="${imageUrl}" 
          alt="${sanitizeInput(product.Name) || 'Product Image'}" 
          class="w-64 h-64 object-cover rounded-xl border border-gray-200 shadow-sm"
        >
      </div>
      <div class="space-y-3 text-gray-700 text-sm">
        <p><span class="font-semibold text-gray-800">Name:</span> <span id="view-product-name">${sanitizeInput(product.Name) || 'N/A'}</span></p>
        <p><span class="font-semibold text-gray-800">ID:</span> <span id="view-product-id">${product.Id || 'N/A'}</span></p>
        <p><span class="font-semibold text-gray-800">Category:</span> <span id="view-product-category">${sanitizeInput(product.Category) || 'N/A'}</span></p>
        <p><span class="font-semibold text-gray-800">Sizes:</span> <span id="view-product-sizes">${sanitizeInput(product.Sizes) || 'N/A'}</span></p>
        <p><span class="font-semibold text-gray-800">Price:</span> <span id="view-product-price" class="text-green-600 font-semibold">$${parseFloat(product.Price).toFixed(2)}</span></p>
        <p><span class="font-semibold text-gray-800">Brand:</span> <span id="view-product-brand">${sanitizeInput(product.Brand) || 'N/A'}</span></p>
        <p><span class="font-semibold text-gray-800">Description:</span> <span id="view-product-description">${sanitizeInput(product.Description) || 'N/A'}</span></p>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
  document.getElementById('close-view-product-modal').addEventListener('click', closeViewProductModal);
}

function viewProduct(id) {
  toggleLoading(true);
  const product = products.find(p => p.Id == id);
  if (product) {
    console.log(`Using local product data for id: ${id}`);
    renderViewModal(product);
    toggleLoading(false);
  } else {
    const selectedCategory = document.getElementById('category-select')?.value || 'espresso';
    searchProduct(id, selectedCategory, function(product) {
      renderViewModal(product);
    });
  }
}

function closeViewProductModal() {
  const modal = document.getElementById('view-product-modal');
  if (modal) modal.classList.add('hidden');
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function filterProducts(searchTerm) {
  const filtered = products.filter(item =>
    (item.Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.Description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.Id || '').toString().includes(searchTerm) ||
    (item.Category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.Brand || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  renderProducts(filtered);
}

function fetchProducts(category = 'espresso', retryCount = 3, delay = 2000) {
  const apiUrl = CATEGORIES[category].api;
  toggleLoading(true);
  fetch(`${apiUrl}?action=read`, { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(result => {
      toggleLoading(false);
      if (result.status === 'success') {
        products = result.data || [];
        if (validateProducts(products, category)) {
          validateCart();
          renderProducts(products);
          const categorySelect = document.getElementById('category-select');
          if (categorySelect) categorySelect.value = category;
        } else {
          showError('Invalid product data format');
        }
      } else {
        throw new Error(result.data || result.message || 'Unknown error');
      }
    })
    .catch(error => {
      console.error(`Fetch error for category '${category}': ${error.message}`);
      toggleLoading(false);
      if (retryCount > 0) {
        console.log(`Retrying fetch for category '${category}' (${retryCount} attempts left)`);
        setTimeout(() => fetchProducts(category, retryCount - 1, delay * 1.5), delay);
      } else {
        showError(`Failed to load ${CATEGORIES[category].name}: ${error.message}. Check Google Apps Script logs.`);
      }
    });
}

function openProductModal(product = null) {
  const modal = document.getElementById('product-modal');
  if (!modal) {
    console.error('Product modal not found');
    showNotification('Error', 'Product modal is missing in the DOM');
    return;
  }
  const form = document.getElementById('product-form');
  const title = document.getElementById('product-modal-title');
  const idInput = document.getElementById('product-id');
  const nameInput = document.getElementById('product-name');
  const logoInput = document.getElementById('product-logo');
  const descriptionInput = document.getElementById('product-description');
  const categoryInput = document.getElementById('product-category');
  const sizesInput = document.getElementById('product-sizes');
  const priceInput = document.getElementById('product-price');
  const brandInput = document.getElementById('product-brand');

  if (!form || !title || !idInput || !nameInput || !logoInput || !descriptionInput || !categoryInput || !sizesInput || !priceInput || !brandInput) {
    console.error('Product form elements not found');
    showNotification('Error', 'Product form elements are missing in the DOM');
    return;
  }

  form.reset();
  idInput.removeAttribute('readonly');
  idInput.value = '';
  title.textContent = product ? 'Edit Product' : 'Add Product';
  if (product) {
    idInput.value = sanitizeInput(product.Id) || '';
    idInput.setAttribute('readonly', 'readonly');
    nameInput.value = sanitizeInput(product.Name) || '';
    logoInput.value = sanitizeUrl(product.Image) || '';
    descriptionInput.value = sanitizeInput(product.Description) || '';
    categoryInput.value = sanitizeInput(product.Category) || '';
    sizesInput.value = sanitizeInput(product.Sizes) || '';
    priceInput.value = parseFloat(product.Price) || '';
    brandInput.value = sanitizeInput(product.Brand) || '';
  } else {
    categoryInput.value = CATEGORIES[document.getElementById('category-select')?.value || 'espresso'].name;
  }

  modal.classList.remove('hidden');
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.add('hidden');
}

function openProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (!modal) {
    console.error('Profile modal not found');
    showNotification('Error', 'Profile modal is missing in the DOM');
    return;
  }
  const userName = localStorage.getItem('name') || 'Guest';
  const modalUserName = document.getElementById('modal-user-name');
  if (modalUserName) modalUserName.textContent = sanitizeInput(userName);
  modal.classList.remove('hidden');
}

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) modal.classList.add('hidden');
}

function handleProductSubmit(e) {
  e.preventDefault();
  const id = sanitizeInput(document.getElementById('product-id').value.trim());
  const name = sanitizeInput(document.getElementById('product-name').value.trim());
  const logo = sanitizeUrl(document.getElementById('product-logo').value.trim());
  const description = sanitizeInput(document.getElementById('product-description').value.trim());
  const category = document.getElementById('product-category').value;
  const sizes = sanitizeInput(document.getElementById('product-sizes').value.trim());
  const price = parseFloat(document.getElementById('product-price').value);
  const brand = sanitizeInput(document.getElementById('product-brand').value.trim());
  const selectedCategory = document.getElementById('category-select')?.value || 'espresso';
  const apiUrl = CATEGORIES[selectedCategory].api;

  if (!id) {
    showNotification('Error', 'Product ID is required');
    return;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    showNotification('Error', 'Product ID must contain only letters, numbers, underscores, or hyphens');
    return;
  }
  if (!name) {
    showNotification('Error', 'Product name is required');
    return;
  }
  if (!sizes) {
    showNotification('Error', 'Sizes are required (e.g., S,M,L)');
    return;
  }
  if (!brand) {
    showNotification('Error', 'Brand name is required');
    return;
  }
  if (isNaN(price) || price < 0) {
    showNotification('Error', 'Please enter a valid non-negative price');
    return;
  }
  if (logo && !isValidUrl(logo)) {
    showNotification('Error', 'Please enter a valid image URL');
    return;
  }
  if (!Object.values(CATEGORIES).some(cat => cat.name === category)) {
    showNotification('Error', 'Invalid category selected');
    return;
  }

  const action = document.getElementById('product-id').hasAttribute('readonly') ? 'update' : 'insert';
  console.log(`Submitting ${action} with id: ${id}, image: ${logo}`);

  if (action === 'insert') {
    if (products.some(p => p.Id === id)) {
      showNotification('Error', `Product ID ${id} already exists`);
      return;
    }
  }

  const formData = new URLSearchParams({
    action,
    id,
    Name: name,
    Category: category,
    Sizes: sizes,
    Price: price,
    Description: description,
    Brand: brand,
    Image: logo
  });

  toggleLoading(true);
  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(result => {
      toggleLoading(false);
      console.log('Response from GAS:', result);
      if (result.status === 'success') {
        closeProductModal();
        fetchProducts(selectedCategory);
        showNotification('Success', `Product ${action === 'insert' ? 'added' : 'updated'} successfully`);
      } else {
        throw new Error(result.data || result.message || 'Unknown error');
      }
    })
    .catch(error => {
      toggleLoading(false);
      console.error('Error saving product:', error.message);
      showNotification('Error', `Error saving product: ${error.message}`);
    });
}

function editProduct(id) {
  toggleLoading(true);
  const product = products.find(p => p.Id == id);
  if (product) {
    console.log(`Using local product data for id: ${id}`);
    openProductModal(product);
    toggleLoading(false);
  } else {
    const selectedCategory = document.getElementById('category-select')?.value || 'espresso';
    console.log(`Fetching product with id: ${id} for category: ${selectedCategory}`);
    searchProduct(id, selectedCategory, function(product) {
      if (!product) {
        showNotification('Error', `Product with ID ${id} not found`);
        toggleLoading(false);
        return;
      }
      console.log('Product fetched for editing:', product);
      openProductModal(product);
    });
  }
}

function deleteProduct(id) {
  showConfirmBox('Are you sure you want to delete this product?', () => {
    const selectedCategory = document.getElementById('category-select')?.value || 'espresso';
    const apiUrl = CATEGORIES[selectedCategory].api;

    console.log(`Deleting product with id: ${id}`);
    const formData = new URLSearchParams({
      action: 'delete',
      id
    });

    toggleLoading(true);
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(result => {
        toggleLoading(false);
        console.log('Delete response:', result);
        if (result.status === 'success') {
          fetchProducts(selectedCategory);
          showNotification('Success', 'Product deleted successfully');
        } else {
          throw new Error(result.data || result.message || 'Unknown error');
        }
      })
      .catch(error => {
        toggleLoading(false);
        console.error('Error deleting product:', error.message);
        showNotification('Error', `Error deleting product: ${error.message}`);
      });
  });
}

function toggleSubmenu(element) {
  const submenu = element.nextElementSibling;
  if (submenu) submenu.classList.toggle('hidden');
}

function toggleDropdown() {
  const dropdown = document.getElementById('dropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
}

function handleLogout() {
  localStorage.removeItem('name');
  localStorage.removeItem('cart');
  window.location.href = 'LoginPage.html';
}

function openCartModal() {
  const cartModal = document.getElementById('cartModal');
  if (!cartModal) {
    console.error('Cart modal not found');
    showNotification('Error', 'Cart modal is missing in the DOM');
    return;
  }
  cartModal.classList.remove('opacity-0', 'invisible');
  cartModal.querySelector('div').classList.remove('translate-x-full');
  updateCartDisplay();
}

function closeCartModal() {
  const cartModal = document.getElementById('cartModal');
  if (cartModal) {
    cartModal.classList.add('opacity-0', 'invisible');
    cartModal.querySelector('div').classList.add('translate-x-full');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const userNameElement = document.getElementById('user-name');
  if (userNameElement) {
    userNameElement.textContent = localStorage.getItem('name') || 'Guest';
  } else {
    console.warn('User name element not found');
  }

  fetchProducts('espresso');
  updateCartDisplay();

  const categorySelect = document.getElementById('category-select');
  if (categorySelect) {
    categorySelect.addEventListener('change', e => fetchProducts(e.target.value));
  } else {
    console.warn('Category select element not found');
  }

  const addProductBtn = document.getElementById('add-product-btn');
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => openProductModal());
  } else {
    console.warn('Add product button not found');
  }

  const closeProductModalBtn = document.getElementById('close-product-modal');
  const cancelProductBtn = document.getElementById('cancel-product');
  const productForm = document.getElementById('product-form');
  if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);
  if (cancelProductBtn) cancelProductBtn.addEventListener('click', closeProductModal);
  if (productForm) productForm.addEventListener('submit', handleProductSubmit);

  const closeProfileModalBtn = document.getElementById('close-profile-modal');
  if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', closeProfileModal);

  const dropdown = document.getElementById('dropdown');
  if (dropdown) {
    dropdown.addEventListener('click', e => {
      if (e.target.closest('li')?.dataset.action === 'profile') {
        openProfileModal();
      }
    });
  }

  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', openCartModal);
  } else {
    console.error('Cart button not found');
    showNotification('Error', 'Cart button is missing in the DOM');
  }

  const closeCartBtn = document.getElementById('closeCartBtn');
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartModal);

  const checkoutCartBtn = document.getElementById('checkoutCartBtn');
  if (checkoutCartBtn) checkoutCartBtn.addEventListener('click', checkoutCart);

  const printCartBtn = document.getElementById('printCartBtn');
  if (printCartBtn) printCartBtn.addEventListener('click', printCart);

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', checkoutNow);

  const closeViewProductModalBtn = document.getElementById('close-view-product-modal');
  if (closeViewProductModalBtn) closeViewProductModalBtn.addEventListener('click', closeViewProductModal);

  const debouncedViewProduct = debounce(viewProduct, 300);
  const debouncedEditProduct = debounce(editProduct, 300);
  const productList = document.getElementById('product-list');
  if (productList) {
    productList.addEventListener('click', e => {
      const editBtn = e.target.closest('.edit-btn');
      const viewBtn = e.target.closest('.view-btn');
      const addToCartBtn = e.target.closest('.add-to-cart-btn');
      const deleteBtn = e.target.closest('.delete-btn');
      if (editBtn) {
        debouncedEditProduct(editBtn.dataset.id);
      } else if (viewBtn) {
        debouncedViewProduct(viewBtn.dataset.id);
      } else if (addToCartBtn) {
        addToCart(addToCartBtn.dataset.id);
      } else if (deleteBtn) {
        deleteProduct(deleteBtn.dataset.id);
      }
    });
  } else {
    console.error('Product list element not found');
    showNotification('Error', 'Product list container is missing in the DOM');
  }

  const cartItems = document.getElementById('cartItems');
  if (cartItems) {
    cartItems.addEventListener('click', e => {
      const increaseBtn = e.target.closest('.increase-qty-btn');
      const decreaseBtn = e.target.closest('.decrease-qty-btn');
      const removeBtn = e.target.closest('.remove-item-btn');
      if (increaseBtn) {
        handleQuantityChange(increaseBtn.dataset.index, 'increase');
      } else if (decreaseBtn) {
        handleQuantityChange(decreaseBtn.dataset.index, 'decrease');
      } else if (removeBtn) {
        removeFromCart(removeBtn.dataset.index);
      }
    });
  } else {
    console.error('Cart items element not found');
    showNotification('Error', 'Cart items container is missing in the DOM');
  }

  const searchInput = document.querySelector('input[placeholder="Search Products"]');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(e => filterProducts(e.target.value), 300));
  } else {
    console.warn('Search input not found');
  }
});