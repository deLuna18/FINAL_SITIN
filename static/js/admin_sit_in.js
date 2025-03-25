// =========================================== SIDEBAR ===========================================
const allDropdown = document.querySelectorAll('#sidebar .side-dropdown');
const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.querySelector('nav .toggle-sidebar');
const allSideDivider = document.querySelectorAll('#sidebar .divider');

// SIDEBAR DROPDOWN
allDropdown.forEach(item => {
    const a = item.parentElement.querySelector('a:first-child');
    a.addEventListener('click', function (e) {
        e.preventDefault();

        if (!this.classList.contains('active')) {
            allDropdown.forEach(i => {
                const aLink = i.parentElement.querySelector('a:first-child');
                aLink.classList.remove('active');
                i.classList.remove('show');
            });
        }

        this.classList.toggle('active');
        item.classList.toggle('show');
    });
});

// SIDEBAR COLLAPSE
toggleSidebar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');

    allSideDivider.forEach(item => {
        item.textContent = sidebar.classList.contains('hide') ? '-' : item.dataset.text;
    });

    if (sidebar.classList.contains('hide')) {
        allDropdown.forEach(item => {
            const a = item.parentElement.querySelector('a:first-child');
            a.classList.remove('active');
            item.classList.remove('show');
        });
    }
});

sidebar.addEventListener('mouseleave', function () {
    if (this.classList.contains('hide')) {
        allDropdown.forEach(item => {
            const a = item.parentElement.querySelector('a:first-child');
            a.classList.remove('active');
            item.classList.remove('show');
        });
        allSideDivider.forEach(item => {
            item.textContent = '-';
        });
    }
});

sidebar.addEventListener('mouseenter', function () {
    if (this.classList.contains('hide')) {
        allDropdown.forEach(item => {
            const a = item.parentElement.querySelector('a:first-child');
            a.classList.remove('active');
            item.classList.remove('show');
        });
        allSideDivider.forEach(item => {
            item.textContent = item.dataset.text;
        });
    }
});

// ============================== CURRENT SIT-INS TABLE FUNCTIONALITY =================================
// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    fetchCurrentSitIns();
    
    // Add event listeners for search and filter
    document.getElementById('searchBtn').addEventListener('click', function() {
        currentSitInPage = 1;
        fetchCurrentSitIns();
    });
    
    document.getElementById('labFilter').addEventListener('change', function() {
        currentSitInPage = 1;
        fetchCurrentSitIns();
    });
});

// Global variables for pagination and filtering
let currentSitInPage = 1;
const sitInPerPage = 10;
let currentLabFilter = '';
let currentSearchQuery = '';

// Fetch and display current sit-ins
async function fetchCurrentSitIns(page = 1) {
    try {
        const labFilter = document.getElementById('labFilter').value;
        const searchQuery = document.getElementById('searchQuery').value;
        
        let url = `/get_current_sit_ins?page=${page}&per_page=${sitInPerPage}`;
        if (labFilter) url += `&lab=${encodeURIComponent(labFilter)}`;
        if (searchQuery) url += `&query=${encodeURIComponent(searchQuery)}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        
        const data = await response.json();
        displayCurrentSitIns(data.sit_ins);
        updatePaginationControls(data.total, page);
        updateEntriesInfo(data.total, page, sitInPerPage);
        
    } catch (error) {
        console.error("Error fetching sit-ins:", error);
        alert("Failed to load sit-ins. Please try again.");
    }
}


function displayCurrentSitIns(sitIns) {
    const tbody = document.getElementById('currentSitInsTableBody');
    tbody.innerHTML = '';
    
    if (!sitIns || sitIns.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">No current sit-ins found</td>
            </tr>
        `;
        return;
    }

    sitIns.forEach(sitIn => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sitIn.student_id || 'N/A'}</td>
            <td>${sitIn.lastname || ''}, ${sitIn.firstname || ''}</td>
            <td>${sitIn.course || 'N/A'}</td>
            <td>${sitIn.year_level || 'N/A'}</td>
            <td>${sitIn.email_address || 'N/A'}</td>
            <td>${sitIn.lab || 'No lab'}</td>
            <td>${sitIn.purpose || 'No purpose'}</td>
            <td>${formatDateTime(sitIn.check_in_time) || 'N/A'}</td>
            <td>
                <button class="check-out-btn" data-id="${sitIn.student_id}">
                    <i class="fas fa-sign-out-alt"></i> Check Out
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Add event listeners to check-out buttons
    document.querySelectorAll('.check-out-btn').forEach(btn => {
        btn.addEventListener('click', handleCheckOut);
    });
}


// Format date-time display
function formatDateTime(datetimeString) {
    if (!datetimeString) return '';
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date(datetimeString).toLocaleString('en-US', options);
}

// Handle check-out
async function handleCheckOut() {
    const studentId = this.dataset.id;
    if (!confirm(`Check out student ${studentId}?`)) return;
    
    try {
        const response = await fetch('/check_out_student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId })
        });
        
        if (!response.ok) throw new Error('Check-out failed');
        
        const result = await response.json();
        if (result.success) {
            alert('Student checked out successfully!');
            fetchCurrentSitIns(currentSitInPage);
        } else {
            throw new Error(result.error || 'Check-out failed');
        }
    } catch (error) {
        console.error('Check-out error:', error);
        alert(`Error: ${error.message}`);
    }
}

// Update pagination controls
function updatePaginationControls(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / sitInPerPage);
    const paginationDiv = document.getElementById('sitInPagination');
    
    let html = `
        <button ${currentPage <= 1 ? 'disabled' : ''} 
                onclick="changeSitInPage(${currentPage - 1})">
            Previous
        </button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button ${currentPage >= totalPages ? 'disabled' : ''} 
                onclick="changeSitInPage(${currentPage + 1})">
            Next
        </button>
    `;
    
    paginationDiv.innerHTML = html;
}

// Change page function (add to global scope)
window.changeSitInPage = function(newPage) {
    currentSitInPage = newPage;
    fetchCurrentSitIns(newPage);
};

// Update entries info text
function updateEntriesInfo(total, page, perPage) {
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    const info = `Showing ${start} to ${end} of ${total} entries`;
    document.getElementById('entriesInfo').textContent = info;
}
