import bottle
from bottle import Bottle, run, get, post, request, route

#app = Bottle()


def fix_environ_middleware(app):
  def fixed_app(environ, start_response):
    environ['wsgi.url_scheme'] = 'https'
    environ['HTTP_X_FORWARDED_HOST'] = 'example.com'
    return app(environ, start_response)
  return fixed_app

app = bottle.default_app()
app.wsgi = fix_environ_middleware(app.wsgi)

@post('/newdoc')
def newdoc():
    print('hit newdoc route')
    return 'hello'

run(app, host='127.0.0.1', port=8081, debug=True)