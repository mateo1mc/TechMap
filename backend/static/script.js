document.addEventListener('DOMContentLoaded', function () {
    // Initial map coordinates and zoom level
    const initialCoordinates = [41.3275, 19.8187];
    const initialZoom = 14;

    // Initialize the map
    const map = L.map('map').setView(initialCoordinates, initialZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let markers = []; // Store markers for easy removal

    // Fetch company data from the backend
    function loadCompanies(searchQuery = '') {
        fetch('/api/companies')
            .then(response => response.json())
            .then(data => {
                // Clear existing markers
                markers.forEach(marker => map.removeLayer(marker));
                markers = [];

                // Filter companies based on search query
                const filteredCompanies = data.filter(company =>
                    company.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                // Add markers for filtered companies
                filteredCompanies.forEach(company => {
                    const marker = L.marker([company.lat, company.lng]).addTo(map);
                    const popupContent = `
                        <b>${company.name}</b><br>
                        ${company.website ? `Website: <a href="${company.website}" target="_blank">${company.website}</a>` : ''}<br>
                        ${company.address ? `Address: <a href="${company.address}" target="_blank">Directions</a>` : ''}<br>
                    `;
                    marker.bindPopup(popupContent);
                    markers.push(marker);
                });

                // Zoom logic
                if (searchQuery && filteredCompanies.length > 0) {
                    // If searching and results exist, zoom to first result
                    const firstCompany = filteredCompanies[0];
                    map.setView([firstCompany.lat, firstCompany.lng], 18); // Zoom level 18
                } else {
                    // If not searching or no results, reset to initial view
                    map.setView(initialCoordinates, initialZoom);
                }

                // Ensure the clear button is visible if there's text in the search bar
                const clearButton = document.getElementById('clearSearch');
                clearButton.style.display = searchQuery ? 'block' : 'none';
            })
            .catch(error => console.error('Error fetching company data:', error));
    }

    // Load all companies initially
    loadCompanies();

    // Clear search input functionality
    document.getElementById('clearSearch').addEventListener('click', function () {
        document.getElementById('searchInput').value = '';
        loadCompanies();
        this.style.display = 'none';
        updateDropdown(''); // Clear the dropdown
    });

    // Show/hide clear button based on input
    document.getElementById('searchInput').addEventListener('input', function () {
        const clearButton = document.getElementById('clearSearch');
        clearButton.style.display = this.value ? 'block' : 'none';
        updateDropdown(this.value); // Update dropdown based on input
    });

    // Load company names for autocomplete
    function loadCompanyNames() {
        fetch('/api/companies')
            .then(response => response.json())
            .then(data => {
                const companyNames = data.map(company => company.name);
                const customDropdown = document.getElementById('customDropdown');

                // Clear existing options
                customDropdown.innerHTML = '';

                // Add options to the custom dropdown
                companyNames.forEach(name => {
                    const option = document.createElement('div');
                    option.textContent = name;
                    option.addEventListener('click', function () {
                        document.getElementById('searchInput').value = name;
                        customDropdown.style.display = 'none';
                        loadCompanies(name); // Filter companies based on the selected option
                    });
                    customDropdown.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching company names:', error));
    }

    // Update dropdown based on search input
    function updateDropdown(searchQuery) {
        const customDropdown = document.getElementById('customDropdown');
        const options = customDropdown.querySelectorAll('div');

        options.forEach(option => {
            if (option.textContent.toLowerCase().includes(searchQuery.toLowerCase())) {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        });

        // Show dropdown if there are matching options
        if (searchQuery && customDropdown.children.length > 0) {
            customDropdown.style.display = 'block';
        } else {
            customDropdown.style.display = 'none';
        }
    }

    // Show dropdown when search input is focused
    document.getElementById('searchInput').addEventListener('focus', function () {
        const customDropdown = document.getElementById('customDropdown');
        if (this.value === '') {
            customDropdown.style.display = 'block';
        }
    });

    // Hide dropdown when search input loses focus
    document.getElementById('searchInput').addEventListener('blur', function () {
        // Hide dropdown after a short delay to allow click events
        setTimeout(() => {
            const customDropdown = document.getElementById('customDropdown');
            customDropdown.style.display = 'none';
        }, 200);
    });

    // Load company names for autocomplete
    loadCompanyNames();

    // Search button functionality
    document.getElementById('searchButton').addEventListener('click', function () {
        const searchQuery = document.getElementById('searchInput').value;
        loadCompanies(searchQuery);
    });

    // "Suggest a Company" - Get the modal and buttons
    const suggestModal = document.getElementById('suggestModal');
    const suggestButton = document.getElementById('suggestButton');
    const closeModal = document.querySelector('.close-modal');
    const suggestForm = document.getElementById('suggestForm');

    // Open the modal when "Suggest a Company" is clicked
    suggestButton.addEventListener('click', function () {
        suggestModal.style.display = 'flex';
    });

    // Close the modal when the close button is clicked
    closeModal.addEventListener('click', function () {
        suggestModal.style.display = 'none';
    });

    // Close the modal when clicking outside the modal
    window.addEventListener('click', function (event) {
        if (event.target === suggestModal) {
            suggestModal.style.display = 'none';
        }
    });

    // Handle form submission
    suggestForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        const companyName = document.getElementById('companyName').value;
        const companyWebsite = document.getElementById('companyWebsite').value;
        const companyAddress = document.getElementById('companyAddress').value;

        // Validate required fields
        if (!companyName || !companyAddress) {
            alert("Company Name and Google Maps Address are required!");
            return;
        }

        // Validate website URL (if provided)
        if (companyWebsite && !companyWebsite.startsWith('http')) {
            alert("Website must start with 'http' or 'https'!");
            return;
        }

        // Send the suggestion to the backend
        fetch('/api/suggest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: companyName,
                website: companyWebsite,
                address: companyAddress,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert('Thank you for your suggestion!');
                    suggestModal.style.display = 'none'; // Close the modal
                    loadCompanies(); // Reload companies to show the new one
                    loadCompanyNames(); // Reload autocomplete suggestions
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error submitting suggestion:', error);
                alert('An error occurred. Please try again.');
            });
    });
});

// Update the footer year dynamically
document.getElementById('currentYear').textContent = new Date().getFullYear();
