const EXAMPLE_USER_DATA = [
  { id: 1, name: 'John Doe', email: 'john.doe@cafe.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@cafe.com', role: 'Manager', status: 'active' },
  { id: 3, name: 'Bob Johnson', email: 'bob.johnson@cafe.com', role: 'Staff', status: 'inactive' }
];

let usersData = [...EXAMPLE_USER_DATA];

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.split('/').pop() === 'users.html') {
    initializeUsers();
  }
});

function initializeUsers() {
  try {
    renderUsersTable(usersData);
    setupUserEventListeners();
    populateRoles();
  } catch (error) {
    console.error('Error initializing users:', error);
  }
}

function renderUsersTable(users) {
  try {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) {
      console.error('Users table body not found');
      return;
    }
    tableBody.innerHTML = '';
    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="border p-2">${user.id}</td>
        <td class="border p-2">${user.name}</td>
        <td class="border p-2">${user.email}</td>
        <td class="border p-2">${user.role}</td>
        <td class="border p-2">${user.status === 'active' ? 'Active' : 'Inactive'}</td>
        <td class="border p-2 text-center">
          <button class="edit-user-btn bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600" data-id="${user.id}">
            <i class="fa-solid fa-edit"></i>
          </button>
          <button class="delete-user-btn bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-id="${user.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error rendering users table:', error);
  }
}

function populateRoles() {
  try {
    const roleSelect = document.getElementById('user-role');
    if (!roleSelect) {
      console.error('Role select not found');
      return;
    }
    const roles = window.rolesData || [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Manager' },
      { id: 3, name: 'Staff' }
    ];
    roleSelect.innerHTML = '<option value="">Select Role</option>';
    roles.forEach(role => {
      const option = document.createElement('option');
      option.value = role.name;
      option.textContent = role.name;
      roleSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating roles:', error);
  }
}

function setupUserEventListeners() {
  try {
    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = document.getElementById('user-modal');
    const closeUserModal = document.getElementById('close-user-modal');
    const cancelUserBtn = document.getElementById('cancel-user-btn');
    const userForm = document.getElementById('user-form');

    if (addUserBtn) {
      addUserBtn.addEventListener('click', () => {
        document.getElementById('user-modal-title').textContent = 'Add User';
        document.getElementById('user-form').reset();
        document.getElementById('user-id').value = '';
        document.getElementById('user-status').value = 'active';
        userModal.classList.remove('hidden');
      });
    }

    if (closeUserModal) {
      closeUserModal.addEventListener('click', () => userModal.classList.add('hidden'));
    }

    if (cancelUserBtn) {
      cancelUserBtn.addEventListener('click', () => userModal.classList.add('hidden'));
    }

    if (userForm) {
      userForm.addEventListener('submit', e => {
        e.preventDefault();
        const id = document.getElementById('user-id').value;
        const name = document.getElementById('user-name').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const role = document.getElementById('user-role').value;
        const status = document.getElementById('user-status').value;

        if (!name || !email || !role) {
          alert('Name, email, and role are required');
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          alert('Invalid email format');
          return;
        }

        if (id) {
          const index = usersData.findIndex(user => user.id === parseInt(id));
          if (index !== -1) {
            usersData[index] = { id: parseInt(id), name, email, role, status };
          }
        } else {
          const newId = usersData.length ? Math.max(...usersData.map(u => u.id)) + 1 : 1;
          usersData.push({ id: newId, name, email, role, status });
        }

        renderUsersTable(usersData);
        userModal.classList.add('hidden');
      });
    }

    document.addEventListener('click', e => {
      if (e.target.closest('.edit-user-btn')) {
        const id = parseInt(e.target.closest('.edit-user-btn').dataset.id);
        const user = usersData.find(u => u.id === id);
        if (user) {
          document.getElementById('user-modal-title').textContent = 'Edit User';
          document.getElementById('user-id').value = user.id;
          document.getElementById('user-name').value = user.name;
          document.getElementById('user-email').value = user.email;
          document.getElementById('user-role').value = user.role;
          document.getElementById('user-status').value = user.status;
          userModal.classList.remove('hidden');
        }
      } else if (e.target.closest('.delete-user-btn')) {
        if (confirm('Are you sure you want to delete this user?')) {
          const id = parseInt(e.target.closest('.delete-user-btn').dataset.id);
          usersData = usersData.filter(user => user.id !== id);
          renderUsersTable(usersData);
        }
      }
    });

    document.addEventListener('search', e => {
      const value = e.detail.value.toLowerCase();
      const filteredUsers = usersData.filter(user =>
        user.name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value)
      );
      renderUsersTable(filteredUsers);
    });
  } catch (error) {
    console.error('Error setting up user event listeners:', error);
  }
}