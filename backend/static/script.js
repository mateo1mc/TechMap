document.addEventListener('DOMContentLoaded', function () {
    // Initial map coordinates and zoom level
    const initialCoordinates = [41.3275, 19.8187];
    const initialZoom = 14;

    // Initialize the map
    const map = L.map('map').setView(initialCoordinates, initialZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors & Mateo Çela'
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
    });

    // Show/hide clear button based on input
    document.getElementById('searchInput').addEventListener('input', function () {
        const clearButton = document.getElementById('clearSearch');
        clearButton.style.display = this.value ? 'block' : 'none';
    });

    // Load company names for autocomplete
    function loadCompanyNames() {
        fetch('/api/companies')
            .then(response => response.json())
            .then(data => {
                const companyNames = data.map(company => company.name);
                const datalist = document.getElementById('companyNames');
                datalist.innerHTML = companyNames.map(name => `<option value="${name}">`).join('');
            })
            .catch(error => console.error('Error fetching company names:', error));
    }

    // Load company names for autocomplete
    loadCompanyNames();

    // Search button functionality
    document.getElementById('searchButton').addEventListener('click', function () {
        const searchQuery = document.getElementById('searchInput').value;
        loadCompanies(searchQuery);
    });

    // View All button functionality
    document.getElementById('viewAllButton').addEventListener('click', function () {
        // Clear the search input and reset the map
        document.getElementById('searchInput').value = '';
        loadCompanies();
    });

    // Suggest a Company button functionality
    document.getElementById('suggestButton').addEventListener('click', function () {
        const companyName = prompt("Enter the name of the company:");
        if (!companyName) {
            alert("Company name is required!");
            return;
        }

        const companyWebsite = prompt("Enter the company's website (optional):");
        if (companyWebsite && !companyWebsite.startsWith('http')) {
            alert("Website must start with 'http' or 'https'!");
            return;
        }

        const companyAddress = prompt("Enter the company's Google Maps address (required):");
        if (!companyAddress) {
            alert("Google Maps address is required!");
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