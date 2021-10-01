from flask import Flask, jsonify, request
from flask_cors import CORS
from date_utility import parse_datetime

app = Flask(__name__)
# cors enable
CORS(app)

# Scraping route
@app.route('/', methods = ['POST'])
def scrapPost():
    try:
        date_string = request.get_json().get('datestring', '')
        converted_date = parse_datetime(date_string)
        return jsonify({ 
            "date" : converted_date, 
            "epoch": converted_date.timestamp(),
            "date_time": converted_date.strftime("%Y-%m-%dT%H:%M:%SZ")
        })
    except Exception as e:
        return jsonify({"massage": "Something went wrong"}), 500

# start app
if __name__ == '__main__':
    app.run(debug=True, port=8989)


