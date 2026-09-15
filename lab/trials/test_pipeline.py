import unittest,tempfile,json
from pathlib import Path
from unittest.mock import patch
import run
class Tests(unittest.TestCase):
 def test_missing_asset(self):
  with self.assertRaises((ValueError,KeyError)):run.validate({'style':'vector','scenes':[{'id':'s','text':'x','actor':'absent'}]}, {})
 def test_duplicate_scene(self):
  with self.assertRaises(ValueError):run.validate({'style':'vector','scenes':[{'id':'s','text':'a'},{'id':'s','text':'b'}]}, {})
 def test_escape(self):
  with self.assertRaises(ValueError):run.resolve_asset({'path':'../../etc/passwd'})
 def test_unsafe_scene(self):
  with self.assertRaises(ValueError):run.validate({'style':'vector','scenes':[{'id':'../escape','text':'a'}]}, {})
 def test_negative_fixed_duration(self):
  with self.assertRaises(ValueError):run.validate({'style':'vector','scenes':[{'id':'s','text':'a','fixedSeconds':-1}]}, {})
 def test_drawing_sample_out_of_range(self):
  with self.assertRaises(ValueError):run.validate({'style':'quickdraw','scenes':[{'id':'s','text':'a','drawing':'cat','sample':200}]}, {})
 def test_all_episodes(self):
  reg=json.loads((run.HERE/'registry.json').read_text())
  for p in (run.HERE/'episodes').glob('*.json'):run.validate(json.loads(p.read_text()),reg)
if __name__=='__main__':unittest.main()
