
const EXAMPLE_TEAM1_DATA = [
  { id: 1, userId: 1, name: 'John Doe', email: 'john.doe@cafe.com', role: 'Leader', status: 'active' },
  { id: 2, userId: 2, name: 'Jane Smith', email: 'jane.smith@cafe.com', role: 'Member', status: 'active' }
];

let teamData = [...EXAMPLE_TEAM1_DATA];

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.split('/').pop() === 'team1.html') {
    initializeTeam();
  }
});

function initializeTeam() {
  try {
    renderTeamTable(teamData);
    setupTeamEventListeners();
    populateUsers();
  } catch (error) {
    console.error('Error initializing Team 1:', error);
  }
}

function renderTeamTable(members) {
  try {
    const tableBody = document.getElementById('team-table-body');
    if (!tableBody) {
      console.error('Team table body not found');
      return;
    }
    tableBody.innerHTML = '';
    members.forEach(member => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="border p-2">${member.id}</td>
        <td class="border p-2">${member.name}</td>
        <td class="border p-2">${member.email}</td>
        <td class="border p-2">${member.role}</td>
        <td class="border p-2">${member.status === 'active' ? 'Active' : 'Inactive'}</td>
        <td class="border p-2 text-center">
          <button class="edit-member-btn bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600" data-id="${member.id}">
            <i class="fa-solid fa-edit"></i>
          </button>
          <button class="delete-member-btn bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-id="${member.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error rendering team table:', error);
  }
}

function populateUsers() {
  try {
    const userSelect = document.getElementById('member-user');
    if (!userSelect) {
      console.error('User select not found');
      return;
    }
    const users = window.usersData || [
      { id: 1, name: 'John Doe', email: 'john.doe@cafe.com' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@cafe.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob.johnson@cafe.com' }
    ];
    userSelect.innerHTML = '<option value="">Select User</option>';
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = `${user.name} (${user.email})`;
      option.dataset.email = user.email;
      userSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating users:', error);
  }
}

function setupTeamEventListeners() {
  try {
    const addMemberBtn = document.getElementById('add-member-btn');
    const memberModal = document.getElementById('member-modal');
    const closeMemberModal = document.getElementById('close-member-modal');
    const cancelMemberBtn = document.getElementById('cancel-member-btn');
    const memberForm = document.getElementById('member-form');

    if (addMemberBtn) {
      addMemberBtn.addEventListener('click', () => {
        document.getElementById('member-modal-title').textContent = 'Add Member';
        document.getElementById('member-form').reset();
        document.getElementById('member-id').value = '';
        document.getElementById('member-status').value = 'active';
        memberModal.classList.remove('hidden');
      });
    }

    if (closeMemberModal) {
      closeMemberModal.addEventListener('click', () => memberModal.classList.add('hidden'));
    }

    if (cancelMemberBtn) {
      cancelMemberBtn.addEventListener('click', () => memberModal.classList.add('hidden'));
    }

    if (memberForm) {
      memberForm.addEventListener('submit', e => {
        e.preventDefault();
        const id = document.getElementById('member-id').value;
        const userId = document.getElementById('member-user').value;
        const role = document.getElementById('member-role').value.trim();
        const status = document.getElementById('member-status').value;

        if (!userId || !role) {
          alert('User and team role are required');
          return;
        }

        const userSelect = document.getElementById('member-user');
        const selectedOption = userSelect.options[userSelect.selectedIndex];
        const name = selectedOption.text.split(' (')[0];
        const email = selectedOption.dataset.email;

        if (id) {
          const index = teamData.findIndex(member => member.id === parseInt(id));
          if (index !== -1) {
            teamData[index] = { id: parseInt(id), userId: parseInt(userId), name, email, role, status };
          }
        } else {
          const newId = teamData.length ? Math.max(...teamData.map(m => m.id)) + 1 : 1;
          if (teamData.some(member => member.userId === parseInt(userId))) {
            alert('User is already a member of Team 1');
            return;
          }
          teamData.push({ id: newId, userId: parseInt(userId), name, email, role, status });
        }

        renderTeamTable(teamData);
        memberModal.classList.add('hidden');
      });
    }

    document.addEventListener('click', e => {
      if (e.target.closest('.edit-member-btn')) {
        const id = parseInt(e.target.closest('.edit-member-btn').dataset.id);
        const member = teamData.find(m => m.id === id);
        if (member) {
          document.getElementById('member-modal-title').textContent = 'Edit Member';
          document.getElementById('member-id').value = member.id;
          document.getElementById('member-user').value = member.userId;
          document.getElementById('member-role').value = member.role;
          document.getElementById('member-status').value = member.status;
          memberModal.classList.remove('hidden');
        }
      } else if (e.target.closest('.delete-member-btn')) {
        if (confirm('Are you sure you want to remove this member from Team 1?')) {
          const id = parseInt(e.target.closest('.delete-member-btn').dataset.id);
          teamData = teamData.filter(member => member.id !== id);
          renderTeamTable(teamData);
        }
      }
    });

    document.addEventListener('search', e => {
      const value = e.detail.value.toLowerCase();
      const filteredMembers = teamData.filter(member =>
        member.name.toLowerCase().includes(value) ||
        member.email.toLowerCase().includes(value) ||
        member.role.toLowerCase().includes(value)
      );
      renderTeamTable(filteredMembers);
    });
  } catch (error) {
    console.error('Error setting up team event listeners:', error);
  }
}