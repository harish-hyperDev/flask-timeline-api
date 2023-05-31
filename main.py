import pandas as pd
import csv, json
from flask import Flask, render_template, jsonify

app = Flask(__name__)


# Home for multi timelines
@app.route('/', methods=['GET', 'POST'])
def home():
    
    df = pd.read_csv('static/data.csv')
    json_data = df.to_json(orient='records')
    
    data_to_dict = json.loads(json_data)[0]
    
    # return jsonify(data)
    return render_template('index.html')


typeof = type
# Needs to be implemented
@app.route('/<opp_id>/<type>', methods=['GET', 'POST'])
def api(opp_id, type):
    df = pd.read_csv('static/data.csv')
    data = df.to_json(orient='records')
    
    print(typeof(data))
    
    return render_template('index.html', 
                           id = opp_id, 
                           json_data = data
                        )


# For fetching data
@app.route('/get_data', methods=['GET'])
def send_data():
    
    csv_file_path = 'static/data.csv'
    data = []
    
    with open(csv_file_path, 'r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            data.append(row)

    # print(json.dumps(data))
    
    # df = pd.read_csv(csv_file_path)
    # json_data = df.to_json(orient='records')
    
    # data_to_dict = json.loads(json_data)[0]
    
    # return jsonify(data)
    return json.dumps(data)


if __name__ == "__main__":
    app.run()