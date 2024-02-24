from http.server import BaseHTTPRequestHandler, HTTPServer
import time
from splitPdf import SplitPdf

hostName = "localhost"
serverPort = 5050
sp = SplitPdf()

class MyServer(BaseHTTPRequestHandler):

    def __init__(self, originalname):
        self.originalname = originalname
        print("self.originalname", self.originalname)

    def __call__(self, originalname, *args, **kwargs):
        """Handle a request."""
        super().__init__(originalname, *args, **kwargs)
    
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()

    def do_POST(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        newDir = "test"
        print('originalname', self.originalname)
        #sp.make_dir(newDir)
        #sp.split_and_convert(something, newDir)
        return
  
if __name__ == "__main__":        
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")