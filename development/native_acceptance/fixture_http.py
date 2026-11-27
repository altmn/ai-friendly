from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import argparse,json,os
p=argparse.ArgumentParser();p.add_argument('--directory',type=Path,required=True);p.add_argument('--metadata',type=Path,required=True);a=p.parse_args()
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kw):super().__init__(*args,directory=str(a.directory),**kw)
    def log_message(self,*args):pass
s=ThreadingHTTPServer(('127.0.0.1',0),Handler);a.metadata.write_text(json.dumps({'origin':f'http://127.0.0.1:{s.server_port}','pid':os.getpid()}))
try:s.serve_forever()
finally:s.server_close()
