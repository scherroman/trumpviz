from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def serve_twitter_data():
    return render_template('trumpviz.html')