import bottle
from bottle import run, get, post, request, route

def fix_environ_middleware(app):
  def fixed_app(environ, start_response):
    environ['wsgi.url_scheme'] = 'https'
    environ['HTTP_X_FORWARDED_HOST'] = 'novodraft.com'
    return app(environ, start_response)
  return fixed_app

app = bottle.default_app()
app.wsgi = fix_environ_middleware(app.wsgi)

@post('/newdoc/<id>')
def newdoc(id='test'):
    print('hit newdoc route, id:', id)
    return 'hello'

run(app, host='127.0.0.1', port=8081, debug=True)