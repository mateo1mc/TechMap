document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map
    const map = L.map('map').setView([41.3275, 19.8187], 12); // Set to your city's coordinates

    // Add a tile layer (use OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Fetch company data from the backend
    fetch('/api/companies')
        .then(response => response.json())
        .then(data => {
            data.forEach(company => {
                // Add a marker for each company
                const marker = L.marker([company.lat, company.lng]).addTo(map);

                // Add a popup with company info
                const popupContent = `
                    <b>${company.name}</b><br>
                    ${company.website ? `Website: <a href="${company.website}" target="_blank">${company.website}</a>` : ''}<br>
                    ${company.address ? `Address: ${company.address}` : ''}<br>
                    ${company.careers ? `Careers: <a href="${company.careers}" target="_blank">Open Positions</a>` : ''}<br>
                    ${company.more_info ? `More Info: <a href="${company.more_info}" target="_blank">Click here</a>` : ''}<br>
                `;
                marker.bindPopup(popupContent);
            });
        })
        .catch(error => console.error('Error fetching company data:', error));
});