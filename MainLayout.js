const CATEGORY = {
  espresso: 'https://script.google.com/macros/s/AKfycbzbEeBBV0tO3QC003lx--Jt-iJa84usx4zAHuzmMUIJ0xFwXyBtAUVNXgtrjofDGVzA/exec',
  iced: 'https://script.google.com/macros/s/AKfycbzjxO5Ge2NMGzYcR2Zzjmpfdw2WJacrMTCEkRXszkdWa7vHEXFQgk8SoGUpluZt2e5qXA/exec',
  non_coffee: 'https://script.google.com/macros/s/AKfycbybZAegH2UA44idH9HKwfrwBZmZiAye04WRFZqJhJ8QILeOs7VxXYvx84yJqllydiNrLA/exec',
  pastries: 'https://script.google.com/macros/s/AKfycbyYMixTHz2VXSpRdw-rV6l0UUvieMWC7GH_fK_dkDFuYYHoglp-J6CRkj_i0Oz7gth6/exec'
};

const EXAMPLE_SALES_DATA = {
  espresso: {
    daily: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      total: Math.random() * 100 + 50
    })),
    monthly: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      total: Math.random() * 1000 + 500
    })),
    yearly: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: Math.random() * 12000 + 6000
    }))
  },
  iced: {
    daily: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      total: Math.random() * 80 + 40
    })),
    monthly: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      total: Math.random() * 800 + 400
    })),
    yearly: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: Math.random() * 10000 + 5000
    }))
  },
  non_coffee: {
    daily: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      total: Math.random() * 60 + 30
    })),
    monthly: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      total: Math.random() * 600 + 300
    })),
    yearly: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: Math.random() * 8000 + 4000
    }))
  },
  pastries: {
    daily: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      total: Math.random() * 70 + 35
    })),
    monthly: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      total: Math.random() * 700 + 350
    })),
    yearly: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: Math.random() * 9000 + 4500
    }))
  }
};

let categoryChart, trendChart, profitChart;

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

function showNotification(title, message) {
  let notificationBox = document.getElementById('custom-notification-box');
  if (!notificationBox) {
    notificationBox = document.createElement('div');
    notificationBox.id = 'custom-notification-box';
    notificationBox.className = 'fixed bottom-4 right-4 z-50 w-80 space-y-2';
    document.body.appendChild(notificationBox);
  }

  const icons = {
    Success: 'fas fa-check-circle text-green-400',
    Error: 'fas fa-times-circle text-red-400',
    Info: 'fas fa-info-circle text-[#00ddeb]',
    Warning: 'fas fa-exclamation-circle text-yellow-400'
  };

  const notification = document.createElement('div');
  notification.className = `
    bg-[#2a2a4a] rounded-xl shadow-2xl p-4 border-l-4
    ${title === 'Error' ? 'border-red-400' : title === 'Success' ? 'border-green-400' : title === 'Warning' ? 'border-yellow-400' : 'border-[#00ddeb]'}
    transform transition-all duration-300 animate-fade-in-up
  `;
  notification.innerHTML = `
    <div class="flex gap-3 items-start">
      <i class="${icons[title] || 'fas fa-bell text-gray-300'} text-2xl mt-1"></i>
      <div class="flex-1">
        <h3 class="text-md font-semibold text-[#00ddeb] font-sans uppercase">${title}</h3>
        <p class="text-sm text-gray-300 font-sans">${message}</p>
      </div>
      <button class="text-gray-300 hover:text-white text-sm mt-1 transition-all duration-300" onclick="this.closest('div[role=alert]').remove()">
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

const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes fade-out-down {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(20px);
    }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.3s ease-out forwards;
  }
  .animate-fade-out-down {
    animation: fade-out-down 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

function showConfirmBox(message, onConfirm) {
  let confirmBox = document.getElementById('custom-confirm-box');
  if (!confirmBox) {
    confirmBox = document.createElement('div');
    confirmBox.id = 'custom-confirm-box';
    confirmBox.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 hidden';
    confirmBox.innerHTML = `
      <div class="bg-[#2a2a4a] rounded-2xl p-6 shadow-2xl w-full max-w-sm relative overflow-hidden">
        <div class="absolute inset-0 opacity-10 pointer-events-none"></div>
        <h3 class="text-xl font-bold mb-4 text-[#00ddeb] font-sans uppercase">Confirm Action</h3>
        <p id="confirm-box-message" class="text-gray-300 mb-6 font-sans text-sm"></p>
        <div class="flex justify-end gap-3">
          <button id="confirm-box-cancel-btn" class="px-4 py-2 bg-[#1f1f3a] text-gray-300 rounded-md hover:bg-[#252550] focus:outline-none focus:ring-2 focus:ring-[#00ddeb] transition-all duration-300 shadow-[0_0_10px_rgba(0,221,235,0.5)]">Cancel</button>
          <button id="confirm-box-ok-btn" class="px-4 py-2 bg-[#00ddeb] text-[#1a1a2e] rounded-md hover:bg-[#00b8c4] focus:outline-none focus:ring-2 focus:ring-[#00ddeb] transition-all duration-300 shadow-[0_0_10px_rgba(0,221,235,0.5)]">Confirm</button>
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

document.addEventListener('DOMContentLoaded', () => {
  const userNameElement = document.getElementById('user-name');
  const profileImageElement = document.getElementById('profile-image');
  const menuItems = document.querySelectorAll('#menu li[data-key]');
  const profileCofeElement = document.getElementById('Profile-Cofe');
  const profileItemElement = document.getElementById('profile-item');
  const closeModalButton = document.getElementById('close-modal');
  const profileModal = document.getElementById('profile-modal');
  const modalUserId = document.getElementById('modal-user-id');
  const modalUserName = document.getElementById('modal-user-name');
  const modalUserEmail = document.getElementById('modal-user-email');
  const modalUserPhone = document.getElementById('modal-user-phone');
  const modalProfileImage = document.getElementById('modal-profile-image');
  const editProfileButton = document.getElementById('edit-profile');
  const editModal = document.getElementById('profile-modal-edit');
  const saveProfileButton = document.getElementById('save-profile');
  const cancelEditButton = document.getElementById('cancel-edit');
  const editNameInput = document.getElementById('edit-name');
  const editEmailInput = document.getElementById('edit-email');
  const editPhoneInput = document.getElementById('edit-phone');
  const editImageInput = document.getElementById('edit-image');
  const closeEditModalButton = document.querySelector('#profile-modal-edit #close-modal');
  const loadingOverlay = document.getElementById('loading-overlay1');

  try {
    const userData = getUserProfileData();
    if (userNameElement) userNameElement.textContent = userData.name;
    if (profileImageElement) profileImageElement.src = userData.image;
  } catch (error) {
    console.error('Error initializing user info:', error);
  }

  try {
    if (!menuItems.length) {
      console.warn('No menu items found with #menu li[data-key] selector');
    }
    const currentPath = window.location.pathname;
    menuItems.forEach(item => {
      item.classList.remove('bg-gray-700', 'text-white');
      const itemPathSegment = item.dataset.key.split('/').pop();
      const currentPageSegment = currentPath.split('/').pop();
      if (itemPathSegment && itemPathSegment === currentPageSegment) {
        item.classList.add('bg-gray-700', 'text-white');
      }
    });
  } catch (error) {
    console.error('Error highlighting active menu item:', error);
  }

  initializeDashboard();
  setupEventListeners();
  updateDashboard();

  if (profileCofeElement) profileCofeElement.addEventListener('click', showProfilCafeeModal);
  if (profileItemElement) profileItemElement.addEventListener('click', showProfileModal);
  if (closeModalButton) closeModalButton.addEventListener('click', closeModal);
  if (profileModal) {
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) closeModal();
    });
  }

  function getUserProfileData() {
    return {
      id: localStorage.getItem('id') || 'No ID',
      name: localStorage.getItem('name') || 'Guest',
      email: localStorage.getItem('email') || 'No email',
      phone: localStorage.getItem('phone') || 'No phone number',
      image: localStorage.getItem('image') || 'No image'
    };
  }

  function showProfileModal() {
    try {
      const userData = getUserProfileData();
      if (modalUserId) modalUserId.textContent = userData.id;
      if (modalUserName) modalUserName.textContent = userData.name;
      if (modalUserEmail) modalUserEmail.textContent = userData.email;
      if (modalUserPhone) modalUserPhone.textContent = userData.phone;
      if (modalProfileImage) modalProfileImage.src = userData.image;
      if (profileModal) profileModal.classList.remove('hidden');
    } catch (error) {
      console.error('Error showing profile modal:', error);
    }
  }

  function closeModal() {
    if (profileModal) profileModal.classList.add('hidden');
  }

  function showProfilCafeeModal() {
    console.log('Showing Café Code modal');
    const cafeModal = document.getElementById('cafe-modal');
    const closeModalBtn = document.getElementById('close-modal-Cafe');

    if (cafeModal) {
      cafeModal.classList.remove('hidden');
    } else {
      console.error('Café modal element not found');
      return;
    }

    cafeModal.addEventListener('click', (e) => {
      if (e.target === cafeModal) {
        console.log('Closing modal via outside click');
        cafeModal.classList.add('hidden');
      }
    });

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        console.log('Closing modal via button');
        cafeModal.classList.add('hidden');
      });
    } else {
      console.error('Close modal button not found');
    }
  }

  function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'text-red-500 text-center my-4';
    errorElement.innerHTML = `<p>Failed to load profile data: ${message}</p>`;
    if (editModal) {
      editModal.querySelector('.flex').prepend(errorElement);
      setTimeout(() => errorElement.remove(), 5000);
    }
  }

  if (editProfileButton) {
    editProfileButton.addEventListener('click', () => {
      try {
        const userData = getUserProfileData();
        if (editNameInput) editNameInput.value = userData.name;
        if (editEmailInput) editEmailInput.value = userData.email;
        if (editPhoneInput) editPhoneInput.value = userData.phone;
        if (editImageInput) editImageInput.value = userData.image;
        if (editModal) editModal.classList.remove('hidden');
        if (profileModal) profileModal.classList.add('hidden');
      } catch (error) {
        console.error('Error opening edit modal:', error);
        showError(error.message);
      }
    });
  }

  if (saveProfileButton) {
    saveProfileButton.addEventListener('click', () => {
      showConfirmBox('Are you sure you want to save changes to your profile?', async () => {
        try {
          if (loadingOverlay) loadingOverlay.classList.remove('hidden');

          const userData = getUserProfileData();
          const userId = userData.id;

          const searchResponse = await fetch(`https://script.google.com/macros/s/AKfycbyENKMzyaE5SjfezoAzVt2QLperscP9npjLkHJ_csM-UEylG8B3e3-eI2YKoabA9P3t/exec?action=search&id=${userId}`, {
            method: 'GET'
          });
          const searchResult = await searchResponse.json();

          if (searchResult.status !== 'success') {
            throw new Error('Failed to retrieve user data: ' + searchResult.data);
          }

          const currentPassword = searchResult.data.password || '';

          const updatedData = {
            action: 'update',
            id: userId,
            image: editImageInput.value || userData.image,
            email: editEmailInput.value || userData.email,
            password: currentPassword,
            name: editNameInput.value || userData.name,
            phone: editPhoneInput.value || userData.phone
          };

          const updateResponse = await fetch('https://script.google.com/macros/s/AKfycbyENKMzyaE5SjfezoAzVt2QLperscP9npjLkHJ_csM-UEylG8B3e3-eI2YKoabA9P3t/exec', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(updatedData).toString()
          });

          const updateResult = await updateResponse.json();
          if (updateResult.status === 'success') {
            localStorage.setItem('name', updatedData.name);
            localStorage.setItem('email', updatedData.email);
            localStorage.setItem('phone', updatedData.phone);
            localStorage.setItem('image', updatedData.image);

            if (modalUserName) modalUserName.textContent = updatedData.name;
            if (modalUserEmail) modalUserEmail.textContent = updatedData.email;
            if (modalUserPhone) modalUserPhone.textContent = updatedData.phone;
            if (modalProfileImage) modalProfileImage.src = updatedData.image;

            if (userNameElement) userNameElement.textContent = updatedData.name;
            if (profileImageElement) profileImageElement.src = updatedData.image;

            if (editModal) editModal.classList.add('hidden');
            if (profileModal) profileModal.classList.remove('hidden');

            showNotification('Success', 'Profile updated successfully!');
          } else {
            console.error('Failed to update profile:', updateResult.data);
            showNotification('Error', 'Failed to update profile: ' + updateResult.data);
          }
        } catch (error) {
          console.error('Error saving profile:', error);
          showError(error.message);
        } finally {
          if (loadingOverlay) loadingOverlay.classList.add('hidden');
        }
      });
    });
  }

  if (cancelEditButton) {
    cancelEditButton.addEventListener('click', () => {
      if (editModal) editModal.classList.add('hidden');
      if (profileModal) profileModal.classList.remove('hidden');
    });
  }

  if (closeEditModalButton) {
    closeEditModalButton.addEventListener('click', () => {
      if (editModal) editModal.classList.add('hidden');
    });
  }

  if (editModal) {
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        editModal.classList.add('hidden');
      }
    });
  }
});

function initializeDashboard() {
  try {
    const categoryCanvas = document.getElementById('categoryChart');
    if (!categoryCanvas) throw new Error('Category chart canvas not found');
    categoryChart = new Chart(categoryCanvas.getContext('2d'), {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    const trendCanvas = document.getElementById('trendChart');
    if (!trendCanvas) throw new Error('Trend chart canvas not found');
    trendChart = new Chart(trendCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'espresso',
            data: [],
            borderColor: '#FF6384',
            fill: false
          },
          {
            label: 'iced',
            data: [],
            borderColor: '#36A2EB',
            fill: false
          },
          {
            label: 'non_coffee',
            data: [],
            borderColor: '#FFCE56',
            fill: false
          },
          {
            label: 'pastries',
            data: [],
            borderColor: '#4BC0C0',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    const profitCanvas = document.getElementById('profitChart');
    if (!profitCanvas) throw new Error('Profit chart canvas not found');
    profitChart = new Chart(profitCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Profit',
          data: [],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    const datePicker = document.getElementById('datePicker');
    if (datePicker) {
      datePicker.value = new Date().toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Error initializing dashboard charts:', error);
  }
}

async function fetchSalesData(category, date, timeRange) {
  try {
    const data = EXAMPLE_SALES_DATA[category][timeRange] || [];
    if (!Array.isArray(data)) {
      throw new Error(`Invalid data format for ${category} ${timeRange}`);
    }
    return data;
  } catch (error) {
    console.error(`Error fetching ${category} data:`, error);
    return [];
  }
}

async function updateDashboard() {
  try {
    const timeRange = document.getElementById('timeRange')?.value || 'daily';
    const date = document.getElementById('datePicker')?.value || new Date().toISOString().split('T')[0];

    const categories = Object.keys(CATEGORY);
    const salesData = await Promise.all(
      categories.map(category => fetchSalesData(category, date, timeRange))
    );

    const categoryTotals = salesData.map((data, index) => ({
      category: categories[index],
      total: data.reduce((sum, item) => sum + (item.total || 0), 0)
    }));

    const profitTotals = categoryTotals.map(item => ({
      category: item.category,
      total: item.total * 0.3 
    }));

    if (categoryChart) {
      categoryChart.data.labels = categoryTotals.map(item => item.category);
      categoryChart.data.datasets[0].data = categoryTotals.map(item => item.total);
      categoryChart.update();
    }

    const trendData = processTrendData(salesData, timeRange);
    if (trendChart) {
      trendChart.data.labels = trendData.labels;
      trendChart.data.datasets[0].data = trendData.datasets.espresso;
      trendChart.data.datasets[1].data = trendData.datasets.iced;
      trendChart.data.datasets[2].data = trendData.datasets.non_coffee;
      trendChart.data.datasets[3].data = trendData.datasets.pastries;
      trendChart.update();
    }

    if (profitChart) {
      profitChart.data.labels = profitTotals.map(item => item.category);
      profitChart.data.datasets[0].data = profitTotals.map(item => item.total);
      profitChart.update();
    }

    updateSummaryStats(categoryTotals, profitTotals, salesData, timeRange);
  } catch (error) {
    console.error('Error updating dashboard:', error);
  }
}

function processTrendData(salesData, timeRange) {
  const labels = [];
  const datasets = {
    espresso: [],
    iced: [],
    non_coffee: [],
    pastries: []
  };

  try {
    if (timeRange === 'daily') {
      for (let i = 0; i < 24; i++) {
        labels.push(`${i}:00`);
        datasets.espresso.push(salesData[0].find(item => item.hour === i)?.total || 0);
        datasets.iced.push(salesData[1].find(item => item.hour === i)?.total || 0);
        datasets.non_coffee.push(salesData[2].find(item => item.hour === i)?.total || 0);
        datasets.pastries.push(salesData[3].find(item => item.hour === i)?.total || 0);
      }
    } else if (timeRange === 'monthly') {
      for (let i = 1; i <= 30; i++) {
        labels.push(`Day ${i}`);
        datasets.espresso.push(salesData[0].find(item => item.day === i)?.total || 0);
        datasets.iced.push(salesData[1].find(item => item.day === i)?.total || 0);
        datasets.non_coffee.push(salesData[2].find(item => item.day === i)?.total || 0);
        datasets.pastries.push(salesData[3].find(item => item.day === i)?.total || 0);
      }
    } else {
      for (let i = 1; i <= 12; i++) {
        labels.push(`Month ${i}`);
        datasets.espresso.push(salesData[0].find(item => item.month === i)?.total || 0);
        datasets.iced.push(salesData[1].find(item => item.month === i)?.total || 0);
        datasets.non_coffee.push(salesData[2].find(item => item.month === i)?.total || 0);
        datasets.pastries.push(salesData[3].find(item => item.month === i)?.total || 0);
      }
    }
  } catch (error) {
    console.error('Error processing trend data:', error);
  }

  return { labels, datasets };
}

function updateSummaryStats(categoryTotals, profitTotals, salesData, timeRange) {
  try {
    const totalSales = categoryTotals.reduce((sum, item) => sum + item.total, 0);
    const totalSalesElement = document.getElementById('totalSales');
    if (totalSalesElement) {
      totalSalesElement.textContent = `$${totalSales.toFixed(2)}`;
    }

    const topCategory = categoryTotals.reduce((max, item) => 
      item.total > max.total ? item : max, { total: 0, category: 'None' });
    const topCategoryElement = document.getElementById('topCategory');
    if (topCategoryElement) {
      topCategoryElement.textContent = topCategory.category;
    }

    const growthRate = calculateGrowthRate(salesData, timeRange);
    const growthRateElement = document.getElementById('growthRate');
    if (growthRateElement) {
      growthRateElement.textContent = `${growthRate.toFixed(1)}%`;
    }

    const totalProfit = profitTotals.reduce((sum, item) => sum + item.total, 0);
    const totalProfitElement = document.getElementById('totalProfit');
    if (totalProfitElement) {
      totalProfitElement.textContent = `$${totalProfit.toFixed(2)}`;
    }
  } catch (error) {
    console.error('Error updating summary stats:', error);
  }
}

function calculateGrowthRate(salesData, timeRange) {
  try {
    const currentTotal = salesData.reduce((sum, data) => 
      sum + data.reduce((s, item) => s + (item.total || 0), 0), 0);
    const previousTotal = currentTotal * 0.9;
    return ((currentTotal - previousTotal) / previousTotal * 100) || 0;
  } catch (error) {
    console.error('Error calculating growth rate:', error);
    return 0;
  }
}

function setupEventListeners() {
  document.querySelectorAll('#menu li[data-key]').forEach(item => {
    item.addEventListener('click', () => {
      try {
        window.location.href = item.dataset.key;
      } catch (error) {
        console.error('Navigation error:', error);
      }
    });
  });
}

function toggleSubmenu(element) {
  const submenu = element.nextElementSibling;
  if (submenu) submenu.classList.toggle('hidden');
}
function toggleDropdown() {
  const dropdown = document.getElementById('dropdown');
  dropdown.classList.toggle('hidden');
}
const dropdownItems = document.querySelectorAll('#dropdown li');
if (dropdownItems) {
  dropdownItems.forEach(item => {
    item.addEventListener('click', () => {
      const dropdown = document.getElementById('dropdown');
      if (dropdown) dropdown.classList.add('hidden');
    });
  });
}
function handleLogout() {
  try {
    localStorage.removeItem('id');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('image');
    localStorage.removeItem('phone');
    window.location.href = "LogoutPage.html";
  } catch (error) {
    console.error('Logout error:', error);
  }
}

function handleSearch(value) {
  console.log('Search:', value);
}