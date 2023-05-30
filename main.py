import pandas as pd
import json
from flask import Flask, render_template, jsonify

app = Flask(__name__)


# Home for multi timelines
@app.route('/', methods=['GET', 'POST'])
def home():
    return render_template('index.html')


# Needs to be implemented
@app.route('/<opp_id>/<type>', methods=['GET', 'POST'])
def api():
    df = pd.read_csv('filename.csv')
    data = df.to_json(orient='records')
    return render_template('index.html')


# Working fine
@app.route('/<id>', methods=['GET', 'POST'])
def mock_api(id):
    return render_template('index.html', id = id)


# For fetching data
@app.route('/get_data', methods=['GET'])
def send_data():
    df = pd.read_csv('static/data.csv')
    data = df.to_json(orient='records')
    
    data_to_dict = json.loads(data)[0]
    
    return jsonify(data_to_dict)


if __name__ == "__main__":
    app.run()