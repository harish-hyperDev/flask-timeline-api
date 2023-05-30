import pandas as pd
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def home():
    df = pd.read_csv('filename.csv')
    data = df.to_json(orient='records')
    
    print(data)
    return render_template('index.html')

@app.route('/<opp_id>/<type>', methods=['GET', 'POST'])
def home():
    df = pd.read_csv('filename.csv')
    data = df.to_json(orient='records')
    return render_template('index.html')

@app.route('/test', methods=['GET'])
def test():
    return 'test'

@app.route('/<id>', methods=['GET', 'POST'])
def api_id(id):
    return render_template('index.html', id = id)



if __name__ == "__main__":
    app.run()