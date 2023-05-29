from flask import Flask

app = Flask(__name__)
import timeline.views

# app.register_blueprint(users, url_prefix='/home')
