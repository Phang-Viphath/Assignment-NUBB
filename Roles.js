const EXAMPLE_ROLES_DATA = [
  { id: 1, name: 'Admin', description: 'Full access to all features', permissions: ['dashboard_view', 'roles_manage', 'users_manage'] },
  { id: 2, name: 'Manager', description: 'Manage products and categories', permissions: ['dashboard_view', 'products_manage', 'categories_manage'] },
  { id: 3, name: 'Staff', description: 'View dashboard and process orders', permissions: ['dashboard_view', 'orders_process'] }
];

const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard_view', name: 'View Dashboard' },
  { id: 'roles_manage', name: 'Manage Roles' },
  { id: 'users_manage', name: 'Manage Users' },
  { id: 'products_manage', name: 'Manage Products' },
  { id: 'categories_manage', name: 'Manage Categories' },
  { id: 'orders_process', name: 'Process Orders' }
];

let rolesData = [...EXAMPLE_ROLES_DATA];

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.split('/').pop() === 'roles.html') {
    initializeRoles();
  }
});

function initializeRoles() {
  try {
    renderRolesTable(rolesData);
    setupRoleEventListeners();
    populatePermissions();
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
}

function renderRolesTable(roles) {
  try {
    const tableBody = document.getElementById('roles-table-body');
    if (!tableBody) {
      console.error('Roles table body not found');
      return;
    }
    tableBody.innerHTML = '';
    roles.forEach(role => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="border p-2">${role.id}</td>
        <td class="border p-2">${role.name}</td>
        <td class="border p-2">${role.description || 'N/A'}</td>
        <td class="border p-2">${role.permissions.map(id => AVAILABLE_PERMISSIONS.find(p => p.id === id)?.name || id).join(', ')}</td>
        <td class="border p-2 text-center">
          <button class="edit-role-btn bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600" data-id="${role.id}">
            <i class="fa-solid fa-edit"></i>
          </button>
          <button class="delete-role-btn bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-id="${role.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error rendering roles table:', error);
  }
}

function populatePermissions() {
  try {
    const permissionsContainer = document.getElementById('permissions-checkboxes');
    if (!permissionsContainer) {
      console.error('Permissions container not found');
      return;
    }
    permissionsContainer.innerHTML = '';
    AVAILABLE_PERMISSIONS.forEach(perm => {
      const div = document.createElement('div');
      div.innerHTML = `
        <input type="checkbox" id="perm-${perm.id}" name="permissions" value="${perm.id}">
        <label for="perm-${perm.id}">${perm.name}</label>
      `;
      permissionsContainer.appendChild(div);
    });
  } catch (error) {
    console.error('Error populating permissions:', error);
  }
}

function setupRoleEventListeners() {
  try {
    const addRoleBtn = document.getElementById('add-role-btn');
    const roleModal = document.getElementById('role-modal');
    const closeRoleModal = document.getElementById('close-role-modal');
    const cancelRoleBtn = document.getElementById('cancel-role-btn');
    const roleForm = document.getElementById('role-form');

    if (addRoleBtn) {
      addRoleBtn.addEventListener('click', () => {
        document.getElementById('role-modal-title').textContent = 'Add Role';
        document.getElementById('role-form').reset();
        document.getElementById('role-id').value = '';
        document.getElementById('permissions-checkboxes').querySelectorAll('input').forEach(input => input.checked = false);
        roleModal.classList.remove('hidden');
      });
    }

    if (closeRoleModal) {
      closeRoleModal.addEventListener('click', () => roleModal.classList.add('hidden'));
    }

    if (cancelRoleBtn) {
      cancelRoleBtn.addEventListener('click', () => roleModal.classList.add('hidden'));
    }

    if (roleForm) {
      roleForm.addEventListener('submit', e => {
        e.preventDefault();
        const id = document.getElementById('role-id').value;
        const name = document.getElementById('role-name').value.trim();
        const description = document.getElementById('role-description').value.trim();
        const permissions = Array.from(document.getElementById('permissions-checkboxes').querySelectorAll('input:checked')).map(input => input.value);

        if (!name) {
          alert('Role name is required');
          return;
        }

        if (id) {
          const index = rolesData.findIndex(role => role.id === parseInt(id));
          if (index !== -1) {
            rolesData[index] = { id: parseInt(id), name, description, permissions };
          }
        } else {
          const newId = rolesData.length ? Math.max(...rolesData.map(r => r.id)) + 1 : 1;
          rolesData.push({ id: newId, name, description, permissions });
        }

        renderRolesTable(rolesData);
        roleModal.classList.add('hidden');
      });
    }

    document.addEventListener('click', e => {
      if (e.target.closest('.edit-role-btn')) {
        const id = parseInt(e.target.closest('.edit-role-btn').dataset.id);
        const role = rolesData.find(r => r.id === id);
        if (role) {
          document.getElementById('role-modal-title').textContent = 'Edit Role';
          document.getElementById('role-id').value = role.id;
          document.getElementById('role-name').value = role.name;
          document.getElementById('role-description').value = role.description;
          document.getElementById('permissions-checkboxes').querySelectorAll('input').forEach(input => {
            input.checked = role.permissions.includes(input.value);
          });
          roleModal.classList.remove('hidden');
        }
      } else if (e.target.closest('.delete-role-btn')) {
        if (confirm('Are you sure you want to delete this role?')) {
          const id = parseInt(e.target.closest('.delete-role-btn').dataset.id);
          rolesData = rolesData.filter(role => role.id !== id);
          renderRolesTable(rolesData);
        }
      }
    });

    document.addEventListener('search', e => {
      const value = e.detail.value.toLowerCase();
      const filteredRoles = rolesData.filter(role =>
        role.name.toLowerCase().includes(value) ||
        (role.description || '').toLowerCase().includes(value)
      );
      renderRolesTable(filteredRoles);
    });
  } catch (error) {
    console.error('Error setting up role event listeners:', error);
  }
}