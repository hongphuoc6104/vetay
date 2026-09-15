import hashlib, json, tempfile, unittest, zipfile
from pathlib import Path
from unittest.mock import patch
import assets

class AssetTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
  self.ctx=patch.object(assets,'CACHE',Path(self.tmp.name));self.ctx.start();self.addCleanup(self.ctx.stop)
 def test_reject_escape(self):
  with self.assertRaises(ValueError):assets.target('../escape')
 def test_reject_archive_escape(self):
  z=assets.CACHE/'bad.zip'
  with zipfile.ZipFile(z,'w') as f:f.writestr('../bad','x')
  with self.assertRaises(ValueError):assets.extract({'extract_to':'out'},z)
 def test_budget(self):
  with patch.object(assets,'LIMIT',2):
   with self.assertRaises(RuntimeError):assets.budget(3)
 def test_checksum(self):
  (assets.CACHE/'asset').write_bytes(b'wrong')
  with self.assertRaises(RuntimeError):assets.download({'file':'asset','sha256':'0'*64})
 def test_extract_and_resume(self):
  z=assets.CACHE/'good.zip'
  with zipfile.ZipFile(z,'w') as f:f.writestr('a.svg','<svg/>')
  assets.extract({'extract_to':'out'},z); assets.extract({'extract_to':'out'},z)
  self.assertEqual((assets.CACHE/'out/a.svg').read_text(),'<svg/>')
 def test_http_resume(self):
  import http.server,threading
  data=b'0123456789'; ranges=[]
  class Handler(http.server.BaseHTTPRequestHandler):
   def do_GET(self):
    ranges.append(self.headers.get('Range'));start=int(self.headers.get('Range','bytes=0-')[6:-1])
    self.send_response(206);self.send_header('Content-Range',f'bytes {start}-9/10');self.send_header('Content-Length',str(10-start));self.end_headers();self.wfile.write(data[start:])
   def log_message(self,*args):pass
  server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler)
  thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
  try:
   (assets.CACHE/'data.part').write_bytes(data[:4])
   result=assets.download({'file':'data','url':f'http://127.0.0.1:{server.server_port}/','sha256':hashlib.sha256(data).hexdigest()})
   self.assertEqual(result.read_bytes(),data);self.assertEqual(ranges,['bytes=4-'])
  finally:server.shutdown();server.server_close();thread.join()
 def test_completed_partial(self):
  data=b'done';(assets.CACHE/'data.part').write_bytes(data)
  result=assets.download({'file':'data','url':'https://invalid.example','sha256':hashlib.sha256(data).hexdigest()})
  self.assertEqual(result.read_bytes(),data)
 def test_quickdraw_prefix(self):
  import io
  row={'recognized':True,'drawing':[[[1,2],[3,4]]],'word':'test'}
  data=((json.dumps(row)+'\n')*20).encode()
  with patch.object(assets,'request',return_value=io.BytesIO(data)):
   dest=assets.download({'file':'sample.ndjson','kind':'quickdraw-prefix','url':'https://unused.example','count':20})
  self.assertEqual(len(dest.read_text().splitlines()),20)
if __name__=='__main__':unittest.main()

