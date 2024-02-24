from http.server import BaseHTTPRequestHandler, HTTPServer
import time
from splitPdf import SplitPdf
import logging

hostName = "localhost"
serverPort = 5050
sp = SplitPdf()

class MyServer(BaseHTTPRequestHandler):
    
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()

    def do_POST(self):
        print('post hit')
        content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
        print('content_length', content_length)
        post_data = self.rfile.read(content_length) # <--- Gets the data itself
        print('post_data', post_data)
        logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                str(self.path), str(self.headers), post_data.decode('utf-8'))
        self.wfile.write("POST request for {}".format(self.path).encode('utf-8'))
  
if __name__ == "__main__":        
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")