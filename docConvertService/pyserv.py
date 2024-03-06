import bottle
from bottle import run, get, post, request, route
from bottle import HTTPResponse
from splitPdf import SplitPdf
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
sp = SplitPdf()
suc = { 
  'ok': True
  }

@post('/parse-new-complaint/<id>')
def newdoc(id='test'):
    newDir = f"{id}" # path[-1].split(".")[0]
    print('newDir', newDir)
    sp.make_dir(newDir)
    path_arg = f"../Documents/Complaints/{id}.pdf"
    print(f"../Documents/Complaints/{id}.pdf")
    sp.split_and_convert(path_arg, newDir)
    respBody = json.dumps({'Status': 'Success'})
    return bottle.HTTPResponse(status=200, body=respBody)

@post('/parse-new-disc-req/<id>')
def newdoc(id='test'):
    newDir = f"{id}"
    print('newDir', newDir)
    sp.make_dir(newDir)
    path_arg = f"../Documents/Uploads/{id}.pdf"
    print("path_arg", path_arg)
    sp.split_and_convert(path_arg, newDir)
    respBody = json.dumps({'Status': 'Success'})
    return bottle.HTTPResponse(status=200, body=respBody)

@post('/gen-req-docx')
def gen_new_docx():
    print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~hitttt me')
    #sp.make_dir(newDir)
    #path_arg = f"../Documents/Uploads/{id}.pdf"
    #print("path_arg", path_arg)
    #sp.split_and_convert(path_arg, newDir)
    respBody = json.dumps({'Status': 'Success'})
    return bottle.HTTPResponse(status=200, body=respBody)

run(app, host='127.0.0.1', port=8081, debug=True)