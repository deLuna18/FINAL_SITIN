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
            <td>${sitIn.sessions_remaining !== undefined ? sitIn.sessions_remaining : '30'}</td>
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

async function handleCheckOut() {
    const studentId = this.getAttribute('data-id');
    const studentName = this.closest('tr').querySelector('td:nth-child(2)').textContent;

    if (!confirm(`Check out ${studentName} (ID: ${studentId})?`)) return;

    try {
        const response = await fetch('/check_out_student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId })
        });

        const result = await response.json();

        if (result.success) {
            alert(`${studentName} checked out successfully!`);
            fetchCurrentSitIns(); // Refresh the table
        } else {
            throw new Error(result.error || "Checkout failed");
        }
    } catch (error) {
        console.error("Checkout error:", error);
        alert(`Error: ${error.message}`);
    }

}


// Update pagination controls - EXACTLY as you want them
function updatePaginationControls(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / sitInPerPage);
    const paginationDiv = document.getElementById('sitInPagination');
    paginationDiv.innerHTML = '';

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.id = 'prevPage';
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage <= 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            changeSitInPage(currentPage - 1);
        }
    });
    paginationDiv.appendChild(prevButton);

    // Page Numbers (1-2-3 style)
    const maxVisiblePages = 3; // Shows exactly 3 page buttons as in your example
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            changeSitInPage(i);
        });
        paginationDiv.appendChild(pageButton);
    }

    // Next Button
    const nextButton = document.createElement('button');
    nextButton.id = 'nextPage';
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage >= totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            changeSitInPage(currentPage + 1);
        }
    });
    paginationDiv.appendChild(nextButton);
}

// Keep your existing global page change function
window.changeSitInPage = function(newPage) {
    currentSitInPage = newPage;
    fetchCurrentSitIns(newPage);
};

// Keep your existing entries info function
function updateEntriesInfo(total, page, perPage) {
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    document.getElementById('entriesInfo').textContent = 
        `Showing ${start} to ${end} of ${total} entries`;
}