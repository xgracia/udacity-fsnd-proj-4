from bottle import route, run, static_file, abort
import json
import requests

@route('/')
def main():
	return static_file('index.html', root='/app')

@route('/js/<filepath:path>')
def js_files(filepath):
	return static_file(filepath, root='/app/js')

@route('/css/<filename>')
def css_files(filename):
	return static_file(filename, root='/app/css')

@route('/yelp_data/<yelp_id>')
def yelp_data(yelp_id):
	# configure yelp api
	configs = json.load(open('yelp_configs.json'))
	headers = {'Authorization': 'Bearer ' + configs.get('api_key')}
	url = configs.get('base_url') + yelp_id
	# make yelp request
	r = requests.get(url, headers=headers)
	if(r.ok):
		return r.json()
	else:
		return abort(500, 'Could not get Yelp Data')

if __name__ == '__main__':
	run(host='0.0.0.0', port=80, debug=True)
