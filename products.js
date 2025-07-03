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
  const loadingElement = document.getElementById('product-loading');
  const errorElement = document.getElementById('product-error');
  const listElement = document.getElementById('product-list');
  if (loadingElement) loadingElement.classList.toggle('hidden', !show);
  if (errorElement) errorElement.classList.add('hidden');
  if (listElement) listElement.classList.toggle('hidden', show);
}

function showError(message) {
  const loadingElement = document.getElementById('product-loading');
  const errorElement = document.getElementById('product-error');
  const listElement = document.getElementById('product-list');
  if (loadingElement) loadingElement.classList.add('hidden');
  if (errorElement) {
    errorElement.classList.remove('hidden');
    errorElement.querySelector('p').textContent = `Failed to load products: ${message}`;
  }
  if (listElement) listElement.classList.add('hidden');
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
    showNotification('Warning', `Some products in ${CATEGORIES[category].name} have invalid or missing image URLs. Update Google Sheets with direct image links.`);
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
  if (cartBadge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
  }
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

  if (!cartItemsElement || !cartSubtotalElement || !cartTotalElement) {
    console.error('Cart display elements not found');
    showNotification('Error', 'Cart display elements are missing in the DOM');
    return;
  }

  if (cart.length === 0) {
    cartItemsElement.innerHTML = '<p class="text-gray-400 text-center py-8 font-sans text-sm">Your cart is empty</p>';
    cartSubtotalElement.textContent = '$0.00';
    cartTotalElement.textContent = '$0.00';
  } else {
    cartItemsElement.innerHTML = cart.map((item, index) => {
      const imageUrl = item['Image'] && isValidUrl(item['Image']) ? sanitizeInput(item['Image']) : 'https://via.placeholder.com/48x48?text=No+Image';
      console.log(`Rendering cart item '${item.Name}' with Image URL: ${imageUrl}`);
      return `
                        <div class="flex justify-between items-center py-2 border-b border-[#00ddeb]">
                            <div class="flex items-center gap-3">
                                <img src="${imageUrl}" alt="${sanitizeInput(item.Name)}" class="w-12 h-12 object-cover rounded-md border border-[#00ddeb]" onerror="handleImageError(this, '${sanitizeInput(item.Name)}', '${imageUrl}')">
                                <div>
                                    <p class="text-gray-200 font-medium font-sans">${sanitizeInput(item.Name)}</p>
                                    <p class="text-gray-300 text-sm font-sans">$${parseFloat(item.Price).toFixed(2)}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button class="decrease-qty-btn text-gray-300 hover:text-[#00ddeb] transition-all duration-300" data-index="${index}" aria-label="Decrease quantity">-</button>
                                <span class="text-gray-200 font-sans">${item.quantity}</span>
                                <button class="increase-qty-btn text-gray-300 hover:text-[#00ddeb] transition-all duration-300" data-index="${index}" aria-label="Increase quantity">+</button>
                                <button class="remove-item-btn text-red-400 hover:text-red-500 transition-all duration-300" data-index="${index}" aria-label="Remove item">
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

function Payment() {
  if (cart.length === 0) {
    showNotification('Error', 'Your cart is empty');
    return;
  }

  const paymentModal = document.getElementById('payment-modal-Show');
  if (!paymentModal) {
    console.error('Payment modal not found');
    showNotification('Error', 'Payment modal is missing in the DOM');
    return;
  }

  paymentModal.classList.remove('hidden');

  const closeModal = () => {
    paymentModal.classList.add('hidden');
  };

  const handlePayment = async () => {
    if (donePaymentBtn.disabled) return;
    donePaymentBtn.disabled = true;
    donePaymentBtn.textContent = 'Processing...';
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('Success', 'Payment processed successfully');
      paymentModal.classList.add('hidden');
      cart = [];
      saveCart();
      updateCartDisplay();
      closeCartModal();
    } catch (error) {
      showNotification('Error', 'Payment processing failed: ' + error.message);
    } finally {
      donePaymentBtn.disabled = false;
      donePaymentBtn.textContent = 'Done';
    }
  };

  const closeModalBtn = document.getElementById('close-modal-QR');
  const donePaymentBtn = document.getElementById('done-payment');

  if (closeModalBtn) {
    closeModalBtn.removeEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
  } else {
    console.error('Close modal button not found');
    showNotification('Error', 'Close modal button is missing in the DOM');
  }

  if (donePaymentBtn) {
    donePaymentBtn.removeEventListener('click', handlePayment);
    donePaymentBtn.addEventListener('click', handlePayment);
  } else {
    console.error('Done payment button not found');
    showNotification('Error', 'Done payment button is missing in the DOM');
  }

  const handleEscKey = (e) => {
    if (e.key === 'Escape' && !paymentModal.classList.contains('hidden')) {
      closeModal();
    }
  };
  document.removeEventListener('keydown', handleEscKey);
  document.addEventListener('keydown', handleEscKey);
}

function CheckInDetail() {
  if (cart.length === 0) {
    showNotification('Error', 'Your cart is empty');
    return;
  }

  const detailModal = document.getElementById('check-detail-modal');
  if (!detailModal) {
    console.error('Check detail modal not found');
    showNotification('Error', 'Check detail modal is missing in the DOM');
    return;
  }

  const detailContent = document.getElementById('cart-detail-content');
  if (!detailContent) {
    console.error('Cart detail content element not found');
    showNotification('Error', 'Cart detail content element is missing in the DOM');
    return;
  }

  detailContent.innerHTML = cart.map(item => {
    const imageUrl = item['Image'] && isValidUrl(item['Image']) ? sanitizeInput(item['Image']) : 'https://via.placeholder.com/48x48?text=No+Image';
    return `
                    <div class="border-b border-[#00ddeb] py-2">
                        <div class="flex items-center gap-3">
                            <img src="${imageUrl}" alt="${sanitizeInput(item.Name)}" class="w-16 h-16 object-cover rounded-md border border-[#00ddeb]" onerror="handleImageError(this, '${sanitizeInput(item.Name)}', '${imageUrl}')">
                            <div class="flex-1">
                                <p class="text-gray-200 font-medium font-sans">${sanitizeInput(item.Name)}</p>
                                <p class="text-sm text-gray-300 font-sans">Quantity: ${item.quantity}</p>
                                <p class="text-sm text-gray-300 font-sans">Total: $${(item.quantity * parseFloat(item.Price)).toFixed(2)}</p>
                                <p class="text-sm text-gray-300 font-sans">Description: ${sanitizeInput(item.Description)}</p>
                            </div>
                        </div>
                    </div>
                `;
  }).join('');

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * parseFloat(item.Price), 0);
  detailContent.innerHTML += `
                <div class="text-right mt-4">
                    <p class="text-lg font-semibold text-gray-200 font-sans">Total: $${subtotal.toFixed(2)}</p>
                </div>
            `;

  detailModal.classList.remove('hidden');

  const closeModalBtn = document.getElementById('close-detail-modal');
  const closeModal = () => {
    detailModal.classList.add('hidden');
  };

  if (closeModalBtn) {
    closeModalBtn.removeEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
  } else {
    console.error('Close detail modal button not found');
    showNotification('Error', 'Close detail modal button is missing in the DOM');
  }

  const handleEscKey = (e) => {
    if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) {
      closeModal();
    }
  };
  document.removeEventListener('keydown', handleEscKey);
  document.addEventListener('keydown', handleEscKey);
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

function renderProducts(productList) {
  const productListElement = document.getElementById('product-list');
  if (!productListElement) {
    console.error('Product list element not found');
    showNotification('Error', 'Product list container is missing in the DOM');
    return;
  }

  productListElement.innerHTML = '';
  if (productList.length === 0) {
    productListElement.innerHTML = '<p class="text-center text-gray-400 col-span-4 font-sans text-sm">No products found. Add a product to get started.</p>';
    return;
  }

  let hasMissingImages = false;
  productListElement.innerHTML = productList.map(item => {
    const imageUrl = item['Image'] && isValidUrl(item['Image']) ? sanitizeInput(item['Image']) : 'https://via.placeholder.com/240x192?text=No+Image';
    if (!item['Image'] || !isValidUrl(item['Image'])) {
      hasMissingImages = true;
    }

    return `
                    <div class="bg-[#2a2a4a] rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 flex flex-col gap-4 border border-[#00ddeb] hover:border-[#00b8c4] relative overflow-hidden">
                        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 pointer-events-none"></div>
                        <div class="relative w-full h-56 rounded-lg overflow-hidden">
                            <img src="${imageUrl}" alt="${sanitizeInput(item.Name)}" class="w-full h-full object-cover" loading="lazy" onerror="handleImageError(this, '${sanitizeInput(item.Name)}', '${imageUrl}')">
                        </div>
                        <div class="flex flex-col flex-grow">
                            <h3 class="text-xl font-bold text-gray-200 truncate font-sans">${sanitizeInput(item.Name)}</h3>
                            <div class="mt-2 space-y-1">
                                <p class="text-sm text-gray-300 font-sans"><span class="font-semibold text-gray-200">Sizes:</span> ${sanitizeInput(item.Sizes) || 'N/A'}</p>
                                <p class="text-sm text-gray-300 font-sans"><span class="font-semibold text-gray-200">Price:</span> $${parseFloat(item.Price).toFixed(2)}</p>
                            </div>
                        </div>
                        <div class="flex justify-around mt-auto">
                            <button class="edit-btn flex items-center gap-1 px-4 py-2 rounded-md bg-[#1f1f3a] text-[#00ddeb] hover:bg-[#252550] hover:text-[#00b8c4] transition-all duration-300 shadow-[0_0_10px_rgba(0,221,235,0.5)]" data-id="${item.Id}" aria-label="Edit product ${item.Name}">
                                <i class="fa-solid fa-edit text-base"></i>
                            </button>
                            <button class="view-btn flex items-center gap-1 px-4 py-2 bg-[#1f1f3a] text-[#00ddeb] rounded-md hover:bg-[#252550] hover:text-[#00b8c4] transition-all duration-300 shadow-[0_0_10px_rgba(0,221,235,0.5)]" data-id="${item.Id}" aria-label="View product ${item.Name}">
                                <i class="fa-solid fa-eye text-base"></i>
                            </button>
                            <button class="add-to-cart-btn flex items-center gap-1 px-4 py-2 bg-[#1f1f3a] text-green-400 rounded-md hover:bg-[#252550] hover:text-green-500 transition-all duration-300 shadow-[0_0_10px_rgba(0,128,0,0.5)]" data-id="${item.Id}" aria-label="Add ${item.Name} to cart">
                                <i class="fas fa-shopping-cart text-base"></i>
                            </button>
                            <button class="delete-btn flex items-center gap-1 px-4 py-2 bg-[#1f1f3a] text-red-400 rounded-md hover:bg-[#252550] hover:text-red-500 transition-all duration-300 shadow-[0_0_10px_rgba(255,0,0,0.5)]" data-id="${item.Id}" aria-label="Delete product ${item.Name}">
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
  toggleLoading(true);
  fetch(`${apiUrl}?action=search&id=${encodeURIComponent(id)}`, { cache: 'default' })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(result => {
      toggleLoading(false);
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

function handleImageError(img, name, originalUrl) {
  img.src = 'https://via.placeholder.com/48x48?text=No+Image';
  img.alt = `No image for ${name}`;
  console.warn(`Failed to load image for ${name} at ${originalUrl}`);
}

function renderViewModal(product) {
  const modal = document.getElementById('view-product-modal');
  if (!modal) {
    console.error('View product modal not found');
    showNotification('Error', 'View product modal is missing in the DOM');
    return;
  }
  const imageUrl = product['Image'] && isValidUrl(product['Image']) ? sanitizeInput(product['Image']) : 'https://via.placeholder.com/240x192?text=No+Image';

  modal.innerHTML = `
                <div class="relative bg-[#2a2a4a] rounded-2xl p-6 shadow-2xl w-full max-w-md mx-auto" role="dialog" aria-modal="true">
                    <div class="absolute inset-0 opacity-10 pointer-events-none"></div>
                    <button id="close-view-product-modal" class="absolute top-4 right-4 text-gray-300 hover:text-white transition-all duration-300" aria-label="Close product modal">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h3 class="text-2xl font-bold mb-5 text-[#00ddeb] text-center font-sans uppercase">Product Details</h3>
                    <div class="flex justify-center mb-5">
                        <img 
                            id="view-product-image" 
                            src="${imageUrl}" 
                            alt="${sanitizeInput(product.Name) || 'Product Image'}" 
                            class="w-64 h-64 object-cover rounded-xl border border-[#00ddeb] shadow-sm"
                            onerror="this.src='https://via.placeholder.com/240x192?text=No+Image'"
                        >
                    </div>
                    <div class="space-y-3 text-gray-200 text-sm font-sans">
                        <p><span class="font-semibold text-gray-300">Name:</span> <span id="view-product-name">${sanitizeInput(product.Name) || 'N/A'}</span></p>
                        <p><span class="font-semibold text-gray-300">ID:</span> <span id="view-product-id">${product.Id || 'N/A'}</span></p>
                        <p><span class="font-semibold text-gray-300">Category:</span> <span id="view-product-category">${sanitizeInput(product.Category) || 'N/A'}</span></p>
                        <p><span class="font-semibold text-gray-300">Sizes:</span> <span id="view-product-sizes">${sanitizeInput(product.Sizes) || 'N/A'}</span></p>
                        <p><span class="font-semibold text-gray-300">Price:</span> <span id="view-product-price" class="text-green-400 font-semibold">$${parseFloat(product.Price).toFixed(2)}</span></p>
                        <p><span class="font-semibold text-gray-300">Brand:</span> <span id="view-product-brand">${sanitizeInput(product.Brand) || 'N/A'}</span></p>
                        <p><span class="font-semibold text-gray-300">Description:</span> <span id="view-product-description">${sanitizeInput(product.Description) || 'N/A'}</span></p>
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
    searchProduct(id, selectedCategory, function (product) {
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
  title.textContent = product ? 'Edit' : 'Add';
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
  if (action === 'insert' && products.some(p => p.Id === id)) {
    showNotification('Error', `Product ID ${id} already exists`);
    return;
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
    searchProduct(id, selectedCategory, function (product) {
      if (!product) {
        showNotification('Error', `Product with ID ${id} not found`);
        toggleLoading(false);
        return;
      }
      openProductModal(product);
    });
  }
}

function deleteProduct(id) {
  showConfirmBox('Are you sure you want to delete this product?', () => {
    const selectedCategory = document.getElementById('category-select')?.value || 'espresso';
    const apiUrl = CATEGORIES[selectedCategory].api;

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
  window.location.href = "LogoutPage.html";
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
  }

  fetchProducts('espresso');
  updateCartDisplay();

  const categorySelect = document.getElementById('category-select');
  if (categorySelect) {
    categorySelect.addEventListener('change', e => fetchProducts(e.target.value));
  }

  const addProductBtn = document.getElementById('add-product-btn');
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => openProductModal());
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
  }

  const closeCartBtn = document.getElementById('closeCartBtn');
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartModal);

  const checkoutCartBtn = document.getElementById('checkoutCartBtn');
  if (checkoutCartBtn) {
    checkoutCartBtn.removeEventListener('click', checkoutCart);
    checkoutCartBtn.addEventListener('click', checkoutCart);
  }

  const checkDetailBtn = document.getElementById('Check-in-detail');
  if (checkDetailBtn) {
    checkDetailBtn.removeEventListener('click', CheckInDetail);
    checkDetailBtn.addEventListener('click', CheckInDetail);
  }

  const PaymentBtn = document.getElementById('Payment-modal');
  if (PaymentBtn) {
    PaymentBtn.removeEventListener('click', Payment);
    PaymentBtn.addEventListener('click', Payment);
  }

  const printCartBtn = document.getElementById('printCartBtn');
  if (printCartBtn) {
    printCartBtn.removeEventListener('click', printCart);
    printCartBtn.addEventListener('click', printCart);
  }

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
  }

  const searchInput = document.querySelector('input[placeholder="Search Products"]');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(e => filterProducts(e.target.value), 300));
  }
});