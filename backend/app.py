from flask import Flask, jsonify, render_template
import json
import os

app = Flask(__name__)

# Load company data from the JSON file
def load_companies():
    file_path = os.path.join(os.path.dirname(__file__), 'companies.json')
    with open(file_path, 'r', encoding='utf-8') as file:
        companies = json.load(file)
    return companies

# API endpoint to get company data
@app.route('/api/companies', methods=['GET'])
def get_companies():
    companies = load_companies()
    return jsonify(companies)

# Serve the main HTML file
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)