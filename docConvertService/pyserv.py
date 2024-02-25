from bottle import Bottle, run, get, post, request, route

app = Bottle()

@app.route('/')

@route('newdoc', method='POST')
def newdoc():
    print('hit newdoc route')

run(app, host='127.0.0.1', port=8081)