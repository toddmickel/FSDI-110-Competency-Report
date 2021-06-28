from flask import Flask, render_template, request, send_from_directory
import os
import requests
import json

app = Flask(__name__) #automagically creates app name (weather_app) - both pinkies up
api_key = "a7e863898e171fc617373ca9a27f89b9"

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                                'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/') # <-- Decorator.  Tells user to return the next function when the user goes to the root of the page
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/api/weather', methods=['POST'])
def weather():
    # get data from js request (lat/long)
    lat = request.json['lat']
    lon = request.json['lon']
    url = "https://api.openweathermap.org/data/2.5/onecall?lat=%s&lon=%s&appid=%s&units=imperial" % (
        lat, lon, api_key)


    # call the openweather api
    response = requests.get(url)
    data = json.loads(response.text)
    return data


if __name__ == '__main__':
    app.run(debug=True)