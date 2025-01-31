from flask import Flask, jsonify, render_template, request
import json
import os

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

# API endpoint to get company data
@app.route('/api/companies', methods=['GET'])
def get_companies():
    companies = load_companies()
    return jsonify(companies)

# API endpoint to handle company suggestions
@app.route('/api/suggest', methods=['POST'])
def suggest_company():
    data = request.json
    companies = load_companies()
    companies.append(data)  # Add the new suggestion to the list
    save_companies(companies)  # Save the updated list to the JSON file
    return jsonify({"status": "success", "message": "Suggestion received!"})

# Serve the main HTML file
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)