document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([41.3275, 19.8187], 12); // Set to your city's coordinates
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
            })
            .catch(error => console.error('Error fetching company data:', error));
    }

    // Load all companies initially
    loadCompanies();

    // Search button functionality
    document.getElementById('searchButton').addEventListener('click', function () {
        const searchQuery = document.getElementById('searchInput').value;
        loadCompanies(searchQuery);
    });

    // Suggest a Company button functionality
    document.getElementById('suggestButton').addEventListener('click', function () {
        const companyName = prompt("Enter the name of the company:");
        if (companyName) {
            const companyInfo = prompt("Enter some information about the company:");
            const companyWebsite = prompt("Enter the company's website (optional):");
            const companyAddress = prompt("Enter the company's address (optional):");
            const companyPhone = prompt("Enter the company's phone number (optional):");

            // Send the suggestion to the backend (you'll need to implement this endpoint)
            fetch('/api/suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: companyName,
                    info: companyInfo,
                    website: companyWebsite,
                    address: companyAddress,
                    phone: companyPhone,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    alert('Thank you for your suggestion!');
                })
                .catch(error => {
                    console.error('Error submitting suggestion:', error);
                    alert('An error occurred. Please try again.');
                });
        }
    });
});