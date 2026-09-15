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
if __name__=='__main__':unittest.main()
