from flask import Flask, jsonify, render_template, request
import json
import os
import re

app = Flask(__name__)

# Load company data from the JSON file
def load_companies():
    file_path = os.path.join(os.path.dirname(__file__), 'companies.json')
    with open(file_path, 'r', encoding='utf-8') as file:
        companies = json.load(file)
    return companies

# Save company data to the JSON file
def save_companies(companies):
    file_path = os.path.join(os.path.dirname(__file__), 'companies.json')
    with open(file_path, 'w', encoding='utf-8') as file:
        
        json.dump(companies, file, ensure_ascii=False, indent=4)

# Extract latitude and longitude from a Google Maps link
def extract_lat_lng_from_gmaps_link(gmaps_link):
    # Regex to extract latitude and longitude from Google Maps link
    match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', gmaps_link)
    if match:
        return float(match.group(1)), float(match.group(2))
    return None, None

# API endpoint to get company data
@app.route('/api/companies', methods=['GET'])
def get_companies():
    companies = load_companies()
    return jsonify(companies)

# API endpoint to handle company suggestions
@app.route('/api/suggest', methods=['POST'])
def suggest_company():
    data = request.json

    # Validate required fields
    if not data.get('name'):
        return jsonify({"status": "error", "message": "Company name is required!"}), 400

    if not data.get('address'):
        return jsonify({"status": "error", "message": "Google Maps address is required!"}), 400

    # Extract latitude and longitude from the Google Maps link
    lat, lng = extract_lat_lng_from_gmaps_link(data['address'])
    if not lat or not lng:
        return jsonify({"status": "error", "message": "Invalid Google Maps link!"}), 400

    # Load existing companies
    companies = load_companies()

    # Generate a new ID (last ID + 1)
    new_id = companies[-1]['id'] + 1 if companies else 0

    # Add the new company
    new_company = {
        "id": new_id,
        "name": data['name'],
        "lat": lat,
        "lng": lng,
        "website": data.get('website', ''),
        "address": data['address']
    }
    companies.append(new_company)

    # Save the updated list to the JSON file
    save_companies(companies)

    return jsonify({"status": "success", "message": "Suggestion received!", "company": new_company})

# Serve the main HTML file
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)