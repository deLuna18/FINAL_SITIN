
// SIDEBAR DROPDOWN
const allDropdown = document.querySelectorAll('#sidebar .side-dropdown');
const sidebar = document.getElementById('sidebar');

allDropdown.forEach(item=> {
	const a = item.parentElement.querySelector('a:first-child');
	a.addEventListener('click', function (e) {
		e.preventDefault();

		if(!this.classList.contains('active')) {
			allDropdown.forEach(i=> {
				const aLink = i.parentElement.querySelector('a:first-child');

				aLink.classList.remove('active');
				i.classList.remove('show');
			})
		}

		this.classList.toggle('active');
		item.classList.toggle('show');
	})
})


// SIDEBAR COLLAPSE
const toggleSidebar = document.querySelector('nav .toggle-sidebar');
const allSideDivider = document.querySelectorAll('#sidebar .divider');

if(sidebar.classList.contains('hide')) {
	allSideDivider.forEach(item=> {
		item.textContent = '-'
	})
	allDropdown.forEach(item=> {
		const a = item.parentElement.querySelector('a:first-child');
		a.classList.remove('active');
		item.classList.remove('show');
	})
} else {
	allSideDivider.forEach(item=> {
		item.textContent = item.dataset.text;
	})
}

toggleSidebar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');

	if(sidebar.classList.contains('hide')) {
		allSideDivider.forEach(item=> {
			item.textContent = '-'
		})

		allDropdown.forEach(item=> {
			const a = item.parentElement.querySelector('a:first-child');
			a.classList.remove('active');
			item.classList.remove('show');
		})
	} else {
		allSideDivider.forEach(item=> {
			item.textContent = item.dataset.text;
		})
	}
})

sidebar.addEventListener('mouseleave', function () {
	if(this.classList.contains('hide')) {
		allDropdown.forEach(item=> {
			const a = item.parentElement.querySelector('a:first-child');
			a.classList.remove('active');
			item.classList.remove('show');
		})
		allSideDivider.forEach(item=> {
			item.textContent = '-'
		})
	}
})

sidebar.addEventListener('mouseenter', function () {
	if(this.classList.contains('hide')) {
		allDropdown.forEach(item=> {
			const a = item.parentElement.querySelector('a:first-child');
			a.classList.remove('active');
			item.classList.remove('show');
		})
		allSideDivider.forEach(item=> {
			item.textContent = item.dataset.text;
		})
	}
})

// PROGRESSBAR
const allProgress = document.querySelectorAll('main .card .progress');

allProgress.forEach(item=> {
	item.style.setProperty('--value', item.dataset.value)
})

// APEXCHART - ENROLLMENT REPORT
let chart;

    function renderChart(data, categories, title) {
      const options = {
        series: [
          { name: title, data: data },
        ],
        chart: { height: 350, type: 'line' },
        colors: ['#5F3B71'],
        dataLabels: { enabled: false },
        stroke: { curve: 'straight', width: 2 },
        markers: { size: 4, colors: ['#5F3B71'] },
        xaxis: {
          categories: categories,
        },
        yaxis: {
          min: 0,
          max: Math.max(...data) + 5, // Dynamically adjust max value
          tickAmount: 5,
        },
        tooltip: {
          enabled: true,
          y: {
            formatter: function (val) {
              return "Enrollments: " + val;
            },
          },
        },
      };

      if (chart) {
        chart.updateOptions(options);
      } else {
        chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
      }
    }

    fetch('/api/enrollment-data')
      .then((response) => response.json())
      .then((enrollmentData) => {
        const timePeriodSelect = document.getElementById('timePeriod');

        timePeriodSelect.addEventListener('change', (event) => {
          const selectedPeriod = event.target.value;
          let data, categories, title;

          if (selectedPeriod === 'weekly') {
            data = enrollmentData.weekly;
            categories = Array.from({ length: enrollmentData.weekly.length }, (_, i) => `Week ${i + 1}`);
            title = 'Weekly Enrollment';
          } else if (selectedPeriod === 'monthly') {
            data = enrollmentData.monthly;
            categories = Array.from({ length: enrollmentData.monthly.length }, (_, i) => `Month ${i + 1}`);
            title = 'Monthly Enrollment';
          } else if (selectedPeriod === 'yearly') {
            data = enrollmentData.yearly;
            categories = Array.from({ length: enrollmentData.yearly.length }, (_, i) => `Year ${i + 1}`);
            title = 'Yearly Enrollment';
          }

          renderChart(data, categories, title);
        });

        // Initial render with weekly data
        const initialData = enrollmentData.weekly;
        const initialCategories = Array.from({ length: enrollmentData.weekly.length }, (_, i) => `Week ${i + 1}`);
        renderChart(initialData, initialCategories, 'Weekly Enrollment');
      });

// ANNOUNCEMENT 
document.addEventListener("DOMContentLoaded", function () {

    document.getElementById('announcementForm').style.display = 'none';

    // OPEN MODAL
    document.getElementById('openModal').addEventListener('click', function() {
        document.getElementById('announcementForm').style.display = 'flex';
    });

    // CLOSE MODAL (BUTTON)
    document.querySelector('.close')?.addEventListener('click', function() {
        document.getElementById('announcementForm').style.display = 'none';
    });

    // CLOSE MODAL (CANCEL BUTTON)
    document.getElementById('cancelAnnouncement').addEventListener('click', function(event) {
        event.preventDefault(); 
        console.log("Cancel button clicked!"); 
        document.getElementById('announcementForm').style.display = 'none';
    });

	// SAVE ANNOUNCEMENT
	document.getElementById('saveAnnouncement').addEventListener('click', function() {
		console.log("Save button clicked!"); 
		let title = document.getElementById('announcementFormTitle').value.trim();
		let content = document.getElementById('announcementFormContent').value.trim();
		console.log('Title:', title); 
		console.log('Content:', content); 
		if (title && content) {
			fetch('/add_announcement', {
				method: 'POST',
				headers: { 
					'Content-Type': 'application/json' 
				},
				body: JSON.stringify({ 'title': title, 'content': content })
			})
			.then(response => response.json())
			.then(data => {
				console.log("Server response:", data); 
				if (data.success) {
					window.location.reload();  
				} else {
					alert("Failed to save announcement.");
				}
			})
			.catch(error => console.error("Error:", error));
		} else {
			alert("Title and content are required.");
		}
	});
	

	// PARA MA CLICKABLE ANG ROWS
	$(document).ready(function() {
		$('#announcementTable').on('click', '.announcement-row', function() {
			const title = $(this).data('title');
			const content = $(this).data('content');
			const datePosted = $(this).data('date-posted');

			$('#announcementTitle').text(title);
			$('#announcementContent').text(content);
			$('#announcementDate').text(datePosted);
			$('#announcementDetailsModal').fadeIn();
		});

		window.closeAnnouncementDetailsModal = function() {
			$('#announcementDetailsModal').fadeOut();
		};
	});


	// DELETE ANNOUNCEMENT 
	window.deleteAnnouncement = function(id) {
		if (!confirm("Are you sure you want to delete this announcement?")) return;
	
		$.ajax({
			url: `/delete-announcement/${id}`,
			type: 'POST',  
			success: function(response) {
				if (response.success) {
					alert("Announcement deleted successfully.");
					location.reload();  
				} else {
					alert(response.message || "Failed to delete the announcement.");
				}
			},
			error: function() {
				alert("An error occurred while deleting the announcement.");
			}
		});
	};
	
	//EDIT  ANNOUNCEMENT 
	let currentAnnouncementId = null;

	// OPEN MODAL
	window.editAnnouncement = function(id) {
		currentAnnouncementId = id;
		$('#announ_cusModal').fadeIn(); 
	};

	// CLOSE MODAL
	$('.announ_cus-close-btn').click(function() {
		$('#announ_cusModal').fadeOut();
	});

	// CLOSE MODAL WHEN CLICKING OUTSIDE
	$(window).click(function(event) {
		if ($(event.target).is('#announ_cusModal')) {
			$('#announ_cusModal').fadeOut();
		}
	});

	// FORM SUBMIT
	$('#announ_cusForm').submit(function(e) {
		e.preventDefault();

		const newContent = $('#announ_cusContent').val().trim();

		if (!newContent) {
			alert("Please enter the announcement content.");
			return;
		}

		$.ajax({
			url: `/edit-announcement/${currentAnnouncementId}`,
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ content: newContent }),
			success: function(response) {
				if (response.success) {
					alert("Announcement updated successfully.");
					location.reload();
				} else {
					alert(response.message || "Failed to update the announcement.");
				}
			},
			error: function(xhr) {
				console.error("Error details:", xhr.responseText);
				alert("An error occurred while updating the announcement.");
			}
		});

		$('#announ_cusModal').fadeOut();
	});


	// SEARCH BARRRR



	// TOTAL STUDENTS - KADTUNG PROGRESS BAR SA CARD
	fetch('/api/total-students')
    .then(response => response.json())
    .then(data => {
        const totalStudents = data.total_students;

        document.getElementById('total-students').textContent = totalStudents;

        const maxCapacity = 200; 
        const percentage = Math.round((totalStudents / maxCapacity) * 100);

        const progress = document.querySelector('.progress');
        progress.style.setProperty('--value', `${percentage}%`); 
        progress.style.width = '100%'; 
        progress.setAttribute('data-value', `${percentage}%`);

        
        const label = document.querySelector('.label');
        label.textContent = `${percentage}%`;
    })
    .catch(error => {
        console.error('Error fetching total students:', error);
    });



	// TOTAL RESERVATIONS - KADTUNG PROGRESS BAR SA CARD
	fetch('/api/total_reservations')
    .then(response => response.json())
    .then(data => {
        const totalReservations = data.total_reservations; 
		
        document.getElementById('total-reservations').textContent = totalReservations;

        const maxCapacity = 150; 
        const percentage = Math.round((totalReservations / maxCapacity) * 100);

       
        const progress = document.querySelector('.progress');
        progress.style.setProperty('--value', `${percentage}%`); 
        progress.style.width = '100%'; 
        progress.setAttribute('data-value', `${percentage}%`); 

        
        const label = document.querySelector('.label');
        label.textContent = `${percentage}%`;
    })
    .catch(error => {
        console.error('Error fetching total reservations:', error);
    });
	
	
});

// SEARCH RESERVED STUDENTS - Triggers when the search button is clicked
// SEARCH REGISTERED STUDENTS
function searchRegisteredStudents() {
    const query = document.getElementById('searchInput').value.trim();

    if (query.length > 0) {
        fetch(`/search_registered_students?query=${query}`)
            .then(response => response.json())
            .then(data => {
                if (data.students && data.students.length > 0) {
                    const student = data.students[0];
                    openStudentModal(student);
                } else {
                    alert("No registered students found matching your search.");
                }
            })
            .catch(error => {
                console.error('Error fetching student data:', error);
                alert("Error searching for students. Please try again.");
            });
    } else {
        alert("Please enter a search term (ID Number or Last Name)");
    }
}

// OPEN STUDENT MODAL WITH DATA
// OPEN STUDENT MODAL WITH DATA
function openStudentModal(student) {
    // Populate all fields
    document.getElementById('studentIdNumber').value = student.idno || 'N/A';
    document.getElementById('studentLastName').value = student.lastname || 'N/A';
    document.getElementById('studentFirstName').value = student.firstname || 'N/A';
    document.getElementById('studentMiddleName').value = student.middlename || 'N/A';
    document.getElementById('studentCourse').value = student.course || 'N/A';
    document.getElementById('studentYearLevel').value = student.year_level || 'N/A';
    document.getElementById('studentEmail').value = student.email_address || 'N/A';
    
    // Display session credits (default is 30)
    document.getElementById('studentSession').value = student.sessions !== undefined ? student.sessions : 30;
    
    // These can be removed if you don't use them
   // Set Lab dropdown (if lab exists in data, else default)
   const labDropdown = document.getElementById('studentLab');
   if (student.lab) {
	   labDropdown.value = student.lab;
   } else {
	   labDropdown.value = "No lab reservation";
   }

   // Set Purpose dropdown (if purpose exists in data, else default)
   const purposeDropdown = document.getElementById('studentPurpose');
   if (student.purpose) {
	   purposeDropdown.value = student.purpose;
   } else {
	   purposeDropdown.value = "No purpose specified";
   }

    // Show modal
    document.getElementById('studentInfoModal').style.display = 'flex';
}

// CLOSE STUDENT MODAL
document.getElementById('closeStudentModal').addEventListener('click', function() {
    document.getElementById('studentInfoModal').style.display = 'none';
});

// CLOSE MODAL WHEN CLICKING OUTSIDE
window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('studentInfoModal')) {
        document.getElementById('studentInfoModal').style.display = 'none';
    }
});

// UPDATE SEARCH BUTTON EVENT LISTENER
document.getElementById('searchBtn').addEventListener('click', searchRegisteredStudents);

// Handle Sit In Button Click
// Handle Sit In Button Click
document.getElementById('confirmSitInBtn').addEventListener('click', function() {
    const studentId = document.getElementById('studentIdNumber').value;
    const lastName = document.getElementById('studentLastName').value;
    const firstName = document.getElementById('studentFirstName').value;
    const middleName = document.getElementById('studentMiddleName').value;
    const course = document.getElementById('studentCourse').value;
    const yearLevel = document.getElementById('studentYearLevel').value;
    const email = document.getElementById('studentEmail').value;
    const lab = document.getElementById('studentLab').value;
    const purpose = document.getElementById('studentPurpose').value;
    

    fetch('/save_sit_in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          student_id: studentId,
          firstname: firstName,
          lastname: lastName,
          middlename: middleName, 
          course: course,
          year_level: yearLevel,
          email_address: email,
          lab: lab,
          purpose: purpose
      })
  })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Sit-in recorded successfully!");
            document.getElementById('studentInfoModal').style.display = 'none';
            // Optional: Refresh the page or update UI
            window.location.reload();
        } else {
            alert("Error: " + (data.error || "Failed to record sit-in"));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to record sit-in. Please try again.");
    });
});