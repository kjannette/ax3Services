from bottle import Bottle, run, get, post, request

app = Bottle()

@app.route('/newdoc/<id:int>')
def newdoc():
    print('id:', id)

run(app, host='localhost', port=5050)