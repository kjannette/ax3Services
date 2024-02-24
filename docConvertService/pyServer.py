from http.server import BaseHTTPRequestHandler, HTTPServer
import time
from splitPdf import SplitPdf

hostName = "localhost"
serverPort = 5050
sp = SplitPdf()

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()

    def do_POST(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        newDir = "test"
        sp.make_dir(newDir)
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