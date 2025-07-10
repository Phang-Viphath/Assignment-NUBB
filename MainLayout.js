function toggleLoading(show) {
  document.getElementById('loading-overlay').classList.toggle('hidden', !show);
}
function toggleLoadingadd(show) {
  document.getElementById('loading-overlay-add').classList.toggle('hidden', !show);
}
function toggleLoadingedit(show) {
  document.getElementById('loading-overlay-edit').classList.toggle('hidden', !show);
}
function toggleLoadingeditprofile(show) {
  document.getElementById('loading-overlay-edit-profile').classList.toggle('hidden', !show);
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

function showNotification(title, message) {
  let notificationBox = document.getElementById('custom-notification-box');
  if (!notificationBox) {
    notificationBox = document.createElement('div');
    notificationBox.id = 'custom-notification-box';
    notificationBox.className = 'fixed bottom-4 right-4 z-50 max-w-[90vw] w-80 space-y-2';
    document.body.appendChild(notificationBox);
  }

  const icons = {
    Success: 'fas fa-check-circle text-[#00ff00]',
    Error: 'fas fa-times-circle text-[#f87171]',
    Info: 'fas fa-info-circle text-[#00ddeb]',
    Warning: 'fas fa-exclamation-circle text-[#facc15]'
  };

  const notification = document.createElement('div');
  notification.className = `
    bg-[#1f1f3a] rounded-xl shadow-[0_0_10px_rgba(0,221,235,0.5)] p-4 border-l-4
    ${title === 'Error' ? 'border-[#f87171]' : title === 'Success' ? 'border-[#00ff00]' : title === 'Warning' ? 'border-[#facc15]' : 'border-[#00ddeb]'}
    transform transition-all duration-500 animate-fade-in-up
  `;
  notification.innerHTML = `
    <div class="flex gap-3 items-start">
      <i class="${icons[title] || 'fas fa-bell text-gray-200'} text-xl mt-1"></i>
      <div class="flex-1">
        <h3 class="text-sm font-semibold text-[#00ddeb] font-sans uppercase">${title}</h3>
        <p class="text-sm text-gray-200 font-sans">${message}</p>
      </div>
      <button class="text-gray-200 hover:text-[#00ddeb] text-sm mt-1 transition-all duration-300" aria-label="Close notification" onclick="this.closest('div[role=alert]').remove()">
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
    confirmBox.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    confirmBox.setAttribute('role', 'dialog');
    confirmBox.setAttribute('aria-modal', 'true');
    confirmBox.setAttribute('aria-labelledby', 'confirm-title');
    const shadow = confirmBox.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .confirm-container {
        background-color: #1f1f3a;
        border-radius: 0.75rem;
        padding: 1rem;
        box-shadow: 0 0 15px rgba(0, 221, 235, 0.7);
        border: 1px solid rgba(0, 221, 235, 0.3);
        width: 100%;
        max-width: 22rem;
        font-family: sans-serif;
      }
      .confirm-title {
        font-size: 1.125rem;
        font-weight: bold;
        color: #00ddeb;
        text-transform: uppercase;
      }
      .confirm-message {
        color: #e5e7eb;
        margin-bottom: 1.5rem;
        font-size: 0.875rem;
      }
      .button-container {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
      }
      .cancel-btn, .ok-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        transition: all 0.3s ease;
        cursor: pointer;
      }
      .cancel-btn {
        background-color: #2a2a4a;
        color: #e5e7eb;
      }
      .cancel-btn:hover {
        background-color: #252550;
      }
      .ok-btn {
        background-color: #00ddeb;
        color: #1a1a2e;
      }
      .ok-btn:hover {
        background-color: #00b8c4;
      }
    `;

    const container = document.createElement('div');
    container.className = 'confirm-container';
    container.innerHTML = `
      <h3 class="confirm-title" id="confirm-title">Confirm Action</h3>
      <p class="confirm-message">${message}</p>
      <div class="button-container">
        <button class="cancel-btn" aria-label="Cancel">Cancel</button>
        <button class="ok-btn" aria-label="Confirm">Confirm</button>
      </div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);
    document.body.appendChild(confirmBox);
  } else {
    const shadow = confirmBox.shadowRoot;
    const messageElement = shadow.querySelector('.confirm-message');
    if (messageElement) {
      messageElement.textContent = message;
    } else {
      console.error('Confirm message element not found in shadow DOM');
      showNotification('Error', 'Failed to update confirmation dialog');
      return;
    }
  }

  confirmBox.classList.remove('hidden');
  confirmBox.style.zIndex = '50';
  const modals = [
    document.getElementById('cartModal'),
    document.getElementById('product-modal'),
    document.getElementById('profile-modal'),
    document.getElementById('view-product-modal'),
    document.getElementById('payment-modal-Show'),
    document.getElementById('check-detail-modal')
  ];

  modals.forEach(modal => {
    if (modal) {
      if (modal.id === 'cartModal') {
        modal.classList.add('opacity-0', 'invisible');
        const cartDiv = modal.querySelector('div');
        if (cartDiv) cartDiv.classList.add('translate-x-full');
      } else {
        modal.classList.add('hidden');
      }
    }
  });
  const shadow = confirmBox.shadowRoot;
  const cancelBtn = shadow.querySelector('.cancel-btn');
  const okBtn = shadow.querySelector('.ok-btn');
  const newCancelBtn = cancelBtn.cloneNode(true);
  const newOkBtn = okBtn.cloneNode(true);
  cancelBtn.replaceWith(newCancelBtn);
  okBtn.replaceWith(newOkBtn);

  const closeConfirmBox = () => {
    confirmBox.classList.add('hidden');
    document.removeEventListener('keydown', handleKeydown);
  };

  newCancelBtn.addEventListener('click', closeConfirmBox, { once: true });

  newOkBtn.addEventListener('click', () => {
    closeConfirmBox();
    onConfirm();
  }, { once: true });

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      closeConfirmBox();
    } else if (e.key === 'Enter') {
      closeConfirmBox();
      onConfirm();
    }
  };
  document.removeEventListener('keydown', handleKeydown);
  document.addEventListener('keydown', handleKeydown);
  const focusableElements = shadow.querySelectorAll('button');
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  newOkBtn.focus();
  const handleFocusTrap = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };
  document.addEventListener('keydown', handleFocusTrap);
  confirmBox.addEventListener('transitionend', () => {
    if (confirmBox.classList.contains('hidden')) {
      document.removeEventListener('keydown', handleFocusTrap);
    }
  }, { once: true });
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

  setupEventListeners();

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
    console.log('saveProfileButton found:', saveProfileButton);
    saveProfileButton.addEventListener('click', () => {
      showConfirmBox('Are you sure you want to save changes to your profile?', async () => {
        try {
          toggleLoadingeditprofile(true);

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
          toggleLoadingeditprofile(false);
        }
      });
    });
  } else {
    console.error('saveProfileButton not found');
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
