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

// ============================== TABLE FUNCTIONALITY =================================
// Global variables
let historyPage = 1;
const historyPerPage = 10;

// Fetch and display checked-out records
async function loadCheckedOutRecords() {
    try {
        const response = await fetch('/get_checked_out_records');
        const data = await response.json();
        
        if (data.success) {
            displayRecords(data.records);
        } else {
            document.getElementById('recordsTable').innerHTML = 
                '<tr><td colspan="7" class="text-center">Failed to load records</td></tr>';
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Display records in table
function displayRecords(records) {
    const tbody = document.querySelector('#recordsTable tbody');
    tbody.innerHTML = '';

    if (!records || records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No checked-out records found</td>
            </tr>
        `;
        return;
    }

    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.student_id || 'N/A'}</td>
            <td>${record.student_name || 'N/A'}</td>
            <td>${record.course || 'N/A'}</td>
            <td>${record.year_level || 'N/A'}</td>
            <td>${record.lab || 'No lab'}</td>
            <td>${record.purpose || 'No purpose'}</td>
            <td>${new Date(record.check_in_time).toLocaleString() || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Load records when page opens
document.addEventListener('DOMContentLoaded', loadCheckedOutRecords);

// Pagination controls
function updateHistoryPagination(total, currentPage) {
    const totalPages = Math.ceil(total / historyPerPage);
    const paginationDiv = document.getElementById('historyPagination');
    
    paginationDiv.innerHTML = `
        <button ${currentPage <= 1 ? 'disabled' : ''} 
                onclick="changeHistoryPage(${currentPage - 1})">
            Previous
        </button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button ${currentPage >= totalPages ? 'disabled' : ''} 
                onclick="changeHistoryPage(${currentPage + 1})">
            Next
        </button>
    `;
}

// Change page function
window.changeHistoryPage = function(newPage) {
    historyPage = newPage;
    fetchSitInHistory(newPage);
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    fetchSitInHistory();
});