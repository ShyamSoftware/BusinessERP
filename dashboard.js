// Check if the user is authenticated
const sessionToken = localStorage.getItem('session_token');

if (!sessionToken) {
  // Redirect to login page if not authenticated
  window.location.href = 'index.html';
}

const logoutButton = document.getElementById('logout-button');

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    // Clear session token and redirect
    localStorage.removeItem('session_token');
    window.location.href = 'index.html';
  });
}


const url = 'https://asjhwvpavluqtwhedjcb.supabase.co/rest/v1/AMAS?select=*';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzamh3dnBhdmx1cXR3aGVkamNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5Mzc4MjYsImV4cCI6MjA1MDUxMzgyNn0.wSwmSssUykAMNiyoB3TXuxcr3VzgKSdTpfgehHtHWcA';

let dataCache = []; // Store all fetched data
let currentSortOrder = 'desc'; // Track current sort order

async function fetchData() {
  try {
    const response = await fetch(url, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    dataCache = data; // Save fetched data for filtering and sorting
    sortDataById(); // Sort data by ID before displaying
  } catch (error) {
    console.error('Error:', error);
  }
}

function sortDataById() {
  dataCache.sort((a, b) => {
    if (currentSortOrder === 'asc') {
      return a.id - b.id; // Ascending
    } else {
      return b.id - a.id; // Descending
    }
  });

  displayData(dataCache);
}

function displayData(data) {
  const tableBody = document.getElementById('data-table').querySelector('tbody');
  tableBody.innerHTML = ''; // Clear existing rows

  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="first-column" data-label="Name">${row.NAME || ''}</td>
      <td class="second-column" data-label="Mobile">${row.MOBILE_NO || ''}</td>
      <td class="third-column">
        <button class="edit-btn" data-id="${row.id}">✏️</button>
        <button class="delete-btn" data-id="${row.id}">❌</button>
        <button class="share-btn" data-id="${row.id}" data-mobile="${row.MOBILE_NO}">📲</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // Attach event listeners to buttons
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', () => openEditModal(button.dataset.id));
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => deleteRecord(button.dataset.id));
  });

  // Attach event listener for Share button
  document.querySelectorAll('.share-btn').forEach(button => {
    button.addEventListener('click', () => shareRecord(button.dataset.mobile));
  });
}

function openEditModal(id) {
  const record = dataCache.find(row => row.id == id);
  if (!record) return;

  // Create and show the edit modal
  const modal = document.createElement('div');
  modal.id = 'edit-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Edit Record</h2>
      <label for="edit-name">Name:</label>
      <input type="text" id="edit-name" value="${record.NAME || ''}" required>
      
      <label for="edit-mobile">Mobile No:</label>
      <input type="text" id="edit-mobile" value="${record.MOBILE_NO || ''}" required>
      
      <label for="edit-address">Address:</label>
      <input type="text" id="edit-address" value="${record.ADDRESS || ''}" >
      
      <label for="edit-city">City:</label>
      <input type="text" id="edit-city" value="${record.CITY || ''}" required>

      <label for="edit-status">Status:</label>
      <select id="edit-status" required>
        <option value="TRUE" ${record.STATUS === true ? 'selected' : ''}>TRUE</option>
        <option value="FALSE" ${record.STATUS === false ? 'selected' : ''}>FALSE</option>
      </select>

      
      <button id="save-btn">Save</button>
      <button id="cancel-btn">Cancel</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Add event listeners for Save and Cancel
  document.getElementById('save-btn').addEventListener('click', () => {
    const newName = document.getElementById('edit-name').value;
    const newMobile = document.getElementById('edit-mobile').value;
    const newAddress = document.getElementById('edit-address').value;
    const newCity = document.getElementById('edit-city').value;
    const newStatus = document.getElementById('edit-status').value;

    if (!newName || !newMobile || !newCity || !newStatus) {
      alert('All fields are required!');
      return;
    }

    updateRecord(id, { 
      NAME: newName, 
      MOBILE_NO: newMobile, 
      ADDRESS: newAddress, 
      CITY: newCity,
      STATUS: newStatus 
    });
    closeModal();
  });

  document.getElementById('cancel-btn').addEventListener('click', closeModal);
}

function closeModal() {
  const modal = document.getElementById('edit-modal');
  if (modal) modal.remove();
}

async function updateRecord(id, updatedData) {
  try {
      const response = await fetch(`${url}&id=eq.${id}`, {
          method: 'PATCH',
          headers: {
              'apikey': apiKey,
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
          throw new Error('Failed to update record');
      }

      // Update local cache and refresh display
      const index = dataCache.findIndex(row => row.id == id);
      if (index > -1) {
          dataCache[index] = { ...dataCache[index], ...updatedData };
          displayData(dataCache);
      }

      alert('Record updated successfully!');
  } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record.');
  }
}

async function deleteRecord(id) {
  const confirmation = confirm('Are you sure you want to delete this record?');
  if (!confirmation) return;

  try {
    const response = await fetch(`${url}&id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete record');
    }

    // Remove the deleted record from the local data cache
    dataCache = dataCache.filter(row => row.id != id);
    displayData(dataCache); // Refresh the table display

    alert('Record deleted successfully!');
  } catch (error) {
    console.error('Error deleting record:', error);
    alert('Failed to delete record.');
  }
}

async function shareRecord(mobileNo) {
  const loggedInEmail = localStorage.getItem('email'); // Get logged-in user's email

  // Fetch user data from the USERS table
  const url = 'https://asjhwvpavluqtwhedjcb.supabase.co/rest/v1/USER?select=EMP_NAME,EMAIL,CM_MSG';
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzamh3dnBhdmx1cXR3aGVkamNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5Mzc4MjYsImV4cCI6MjA1MDUxMzgyNn0.wSwmSssUykAMNiyoB3TXuxcr3VzgKSdTpfgehHtHWcA';

  try {
    const response = await fetch(`${url}&EMAIL=eq.${loggedInEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const users = await response.json();

    if (users.length === 0) {
      console.error('User not found.');
      return;
    }

    // Assuming users[0] contains the logged-in user details
    const user = users[0];
    const userName = user.CM_MSG || 'Customer'; // Use 'Customer' if EMP_NAME is not available

    // Create personalized message using the user's name
    const message = `Hello ${userName}`;

    const encodedMessage = encodeURIComponent(message); // Encode the message for URL

    // Determine if the user is on Android
    const isAndroid = /Android/i.test(navigator.userAgent);

    let whatsappUri;
    if (isAndroid) {
      whatsappUri = `whatsapp://send?phone=${mobileNo}&text=${encodedMessage}`;
    } else {
      whatsappUri = `https://web.whatsapp.com/send?phone=${mobileNo}&text=${encodedMessage}`;
    }

    // Open WhatsApp in a new tab or the app if it's on mobile
    window.open(whatsappUri, '_blank');
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}


function filterData() {
  const searchTerm = document.getElementById('search').value.toLowerCase();

  const filteredData = dataCache.filter(row => {
    const name = row.NAME ? row.NAME.toLowerCase() : '';
    const mobileNo = row.MOBILE_NO ? row.MOBILE_NO.toLowerCase() : '';
    return name.includes(searchTerm) || mobileNo.includes(searchTerm);
  });

  displayData(filteredData);
}

function toggleSortOrder() {
  currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
  document.getElementById('sort-btn').textContent = `Sort by id (${currentSortOrder === 'asc' ? 'Ascending' : 'Descending'})`;
  sortDataById();
}

document.getElementById('add-record-btn').addEventListener('click', openAddModal);

async function fetchUsers() {
  const loggedInEmail = localStorage.getItem('email'); // Retrieve the logged-in user's email
  const usersUrl = 'https://asjhwvpavluqtwhedjcb.supabase.co/rest/v1/USER?select=EMP_NAME,EMAIL';

  try {
    const response = await fetch(usersUrl, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const users = await response.json();

    return users.map(user => ({
      ...user,
      isDefault: user.EMAIL === loggedInEmail, // Mark if this is the default user
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

async function openAddModal() {
  const users = await fetchUsers();

  const modal = document.createElement('div');
  modal.id = 'add-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Add Record</h2>
      <label for="add-name">Name:</label>
      <input type="text" id="add-name" required>
      
      <label for="add-mobile">Mobile No:</label>
      <input type="text" id="add-mobile" required>
      
      <label for="add-address">Address:</label>
      <input type="text" id="add-address" >
      
      <label for="add-city">City:</label>
      <input type="text" id="add-city" required>

      <label for="add-status">Status:</label>
      <select id="add-status" required>
      <option value="FALSE">FALSE</option>  
      <option value="TRUE">TRUE</option>
      </select>

      <label for="add-user-code">User Code:</label>
      <select id="add-user-code" required>
        <option value="" disabled>Select User</option>
        ${users.map(user => `
          <option value="${user.USER_CODE}" ${user.isDefault ? 'selected' : ''}>
            ${user.EMP_NAME}
          </option>`).join('')}
      </select>

      <button id="insert-btn">Add</button>
      <button id="cancel-add-btn">Cancel</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('insert-btn').addEventListener('click', insertRecord);
  document.getElementById('cancel-add-btn').addEventListener('click', closeAddModal);
}

function closeAddModal() {
  const modal = document.getElementById('add-modal');
  if (modal) modal.remove();
}

async function insertRecord() {
  const newName = document.getElementById('add-name').value;
  const newMobile = document.getElementById('add-mobile').value;
  const newAddress = document.getElementById('add-address').value;
  const newCity = document.getElementById('add-city').value;
  const newStatus = document.getElementById('add-status').value === 'TRUE';
  const userCode = document.getElementById('add-user-code').value;

  if (!newName || !newMobile || !newCity || !userCode) {
    alert('All fields are required!');
    return;
  }

  const newRecord = {
    NAME: newName,
    MOBILE_NO: newMobile,
    ADDRESS: newAddress,
    CITY: newCity,
    STATUS: newStatus,
    USER_CODE: userCode, // Add the selected User Code
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRecord),
    });

    if (!response.ok) {
      throw new Error('Failed to add record');
    }

    // Fetch and refresh data after successful insertion
    await fetchData();
    alert('Record added successfully!');
    closeAddModal();
  } catch (error) {
    console.error('Error adding record:', error);
    alert('Failed to add record.');
  }
}

// Initial fetch
fetchData();
