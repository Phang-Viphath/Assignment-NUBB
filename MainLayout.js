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

document.addEventListener('DOMContentLoaded', () => {
  const userNameElement = document.getElementById('user-name');
  const profileImageElement = document.getElementById('profile-image');
  const menuItems = document.querySelectorAll('#menu li[data-key]');
  const logoElement = document.getElementById('logo');
  const profileItemElement = document.getElementById('profile-item');
  const closeModalButton = document.getElementById('close-modal');
  const profileModal = document.getElementById('profile-modal');
  const modalUserId = document.getElementById('modal-user-id');
  const modalUserName = document.getElementById('modal-user-name');
  const modalUserEmail = document.getElementById('modal-user-email');
  const modalUserPhone = document.getElementById('modal-user-phone');
  const modalProfileImage = document.getElementById('modal-profile-image');

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
  if (logoElement) logoElement.addEventListener('click', showProfileModal);
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
      image: localStorage.getItem('image') || 'https://github.com/Phang-Viphath/Image/blob/main/Brand/15.jpg?raw=true'
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
});

document.addEventListener('DOMContentLoaded', () => {
    const userNameElement = document.getElementById('user-name');
    const profileImageElement = document.getElementById('profile-image');
    const menuItems = document.querySelectorAll('#menu li[data-key]');
    const logoElement = document.getElementById('logo');
    const profileItemElement = document.getElementById('profile-item');
    const closeModalButton = document.getElementById('close-modal');
    const profileModal = document.getElementById('profile-modal');
    const modalUserId = document.getElementById('modal-user-id');
    const modalUserName = document.getElementById('modal-user-name');
    const modalUserEmail = document.getElementById('modal-user-email');
    const modalUserPhone = document.getElementById('modal-user-phone');
    const modalProfileImage = document.getElementById('modal-profile-image');

    const getUserProfileData = () => {
        return {
            id: localStorage.getItem('id') || 'No ID',
            name: localStorage.getItem('name') || 'Guest',
            email: localStorage.getItem('email') || 'No email',
            phone: localStorage.getItem('phone') || 'No phone number',
            image: localStorage.getItem('image') || 'https://github.com/Phang-Viphath/Image/blob/main/Brand/15.jpg?raw=true'
        };
    };

    try {
        const userData = getUserProfileData();
        if (userNameElement) userNameElement.textContent = userData.name;
    } catch (error) {
        console.error('Error initializing user info:', error);
    }

    const currentPath = window.location.pathname;
    menuItems.forEach(item => {
        item.classList.remove('bg-gray-700', 'text-white');

        const itemPathSegment = item.dataset.key.split('/').pop();
        const currentPageSegment = currentPath.split('/').pop();

        if (itemPathSegment === currentPageSegment) {
            item.classList.add('bg-gray-700', 'text-white');
        }

        item.addEventListener('click', () => {
            try {
                window.location.href = item.dataset.key;
            } catch (error) {
                console.error('Navigation error:', error);
            }
        });
    });

    if (logoElement) {
        logoElement.addEventListener('click', showProfileModal);
    }
    if (profileItemElement) {
        profileItemElement.addEventListener('click', showProfileModal);
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

    if (profileModal) {
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                closeModal();
            }
        });
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
    // Placeholder for actual API fetch
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
  if (dropdown) dropdown.classList.toggle('hidden');
}

function handleLogout() {
  try {
    localStorage.removeItem('id');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('image');
    localStorage.removeItem('phone');
    window.location.href = "LoginPage.html";
  } catch (error) {
    console.error('Logout error:', error);
  }
}

function handleSearch(value) {
  console.log('Search:', value);
}