import bottle
from bottle import run, get, post, request, route
from bottle import HTTPResponse
from generateDocument import GenerateBody
from pathlib import Path
import json

def fix_environ_middleware(app):
  def fixed_app(environ, start_response):
    environ['wsgi.url_scheme'] = 'https'
    environ['HTTP_X_FORWARDED_HOST'] = 'novodraft.com'
    return app(environ, start_response)
  return fixed_app

app = bottle.default_app()
app.wsgi = fix_environ_middleware(app.wsgi)
gen_body = GenerateBody()
suc = { 
  'ok': True
  }


@post('/gen-req-docx/<docId>')
def newdoc(docId):
    print('docId', docId)
    gen_body.generate(docId)
    respBody = json.dumps({'Status': 'Success'})
    return bottle.HTTPResponse(status=200, body=respBody)

run(app, host='127.0.0.1', port=8081, debug=True)