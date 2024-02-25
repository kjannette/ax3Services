from bottle import Bottle, run, get, post, request

app = Bottle()

@app.route('/v1/gen-disc-request/', method='POST')
def newdoc():
    print('hit post route')

run(app, host='127.0.0.1', port=8081)