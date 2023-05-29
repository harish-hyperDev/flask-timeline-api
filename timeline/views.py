from flask import render_template
from .app import app

@app.route('/', methods=['GET', 'POST'])
def home():
    return render_template('index.html')

@app.route('/test', methods=['GET'])
def test():
    return 'test'

@app.route('/<id>', methods=['GET', 'POST'])
def test_id(id):
    return render_template('index.html', id = id)