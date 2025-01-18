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
      <input type="text" id="edit-address" value="${record.ADDRESS || ''}" required>
      
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

    if (!newName || !newMobile || !newAddress || !newCity || !newStatus) {
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


function shareRecord(mobileNo) {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const message = "Thank you for visiting *Bemor* - We hope you had a great experience exploring our furniture collection. Your feedback means the world to us! Please take a moment to share your thoughts by leaving us a review here: https://g.co/kgs/Qws5fwY. Looking forward to serving you again!";
  //const whatsappURL = `https://wa.me/${mobileNo}?text=${encodeURIComponent(message)}`;

  if (isAndroid) {
    const businessWAURL = `intent://send/?phone=${mobileNo}&text=${encodeURIComponent(message)}#Intent;package=com.whatsapp.w4b;end;`;
    window.location.href = businessWAURL;
  } else {
    const whatsappURL = `https://wa.me/${mobileNo}?text=${encodeURIComponent(message)}`;
    //window.location.href = whatsappURL;
    window.open(whatsappURL, '_blank');
  }

  // Open WhatsApp in a new tab or the app if it's on mobile
  //window.open(whatsappURL, '_blank');
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

// Initial fetch
fetchData();
