import importlib.util,json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('workflow',Path(__file__).with_name('workflow.py'));w=importlib.util.module_from_spec(spec);spec.loader.exec_module(w)
class WorkflowTests(unittest.TestCase):
 def sample(self):return {'duration':10,'fps':30,'scenes':[{'id':'a','seconds':5,'text':'A'},{'id':'b','seconds':5,'text':'B'}]}
 def test_long_speech_borrows_slack_without_overlap(self):
  t=w.schedule(self.sample(),[6,1]);self.assertGreaterEqual(t['scenes'][0]['duration'],6.25);self.assertEqual(t['scenes'][-1]['end'],10);self.assertEqual(t['scenes'][0]['end'],t['scenes'][1]['start'])
 def test_overlong_speech_rejected(self):
  with self.assertRaises(ValueError):w.schedule(self.sample(),[6,6])
 def test_fingerprint_changes_on_art_or_script(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d);f=p/'scene.tsx';f.write_text('one');a=w.fingerprint(p);f.write_text('two');self.assertNotEqual(a,w.fingerprint(p))
 def test_caption_ranges_follow_audio(self):
  s=w.schedule(self.sample());c=w.captions(s,[{'duration':1},{'duration':2}]);self.assertEqual(c[-1]['end'],7);self.assertLessEqual(c[0]['end'],c[1]['start'])
 def test_exclusive_lock(self):
  with tempfile.TemporaryDirectory() as d,patch.object(w,'OUT',Path(d)):
   with w.lock():
    with self.assertRaises(ValueError):
     with w.lock():pass
 def test_missing_code_rejected(self):
  with tempfile.TemporaryDirectory() as d,patch.object(w,'EPISODES',Path(d)):
   p=Path(d)/'x';p.mkdir();s=dict(self.sample(),id='x',title='x',audience='all',language='vi',domain='story',width=1080,height=1920,status='draft',assets=[],sources=[])
   for x in s['scenes']:x.update(action='move',camera='wide')
   (p/'episode.json').write_text(json.dumps(s))
   with self.assertRaisesRegex(ValueError,'Missing scene.tsx'):w.load('x')
 def test_budget_rejects_free_disk_shortage(self):
  from collections import namedtuple
  disk=namedtuple('disk','total used free')
  with tempfile.TemporaryDirectory() as d,patch.object(w,'CACHE',Path(d)),patch.object(w.shutil,'disk_usage',return_value=disk(30_000_000_000,29_000_000_000,1_000_000_000)):
   with self.assertRaisesRegex(ValueError,'reserve'):w.budget()
 def test_episode_path_traversal(self):
  with self.assertRaises(ValueError):w.load('../x')
class PackageFailureTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name);self.folder=self.root/'x';self.folder.mkdir()
  self.spec={'id':'x','title':'X','audience':'all','language':'vi','domain':'science','width':1080,'height':1920,'duration':10,'fps':30,'status':'draft','scenes':[{'id':'a','seconds':10,'text':'','action':'move','camera':'wide'}],'assets':[{'path':'scene.tsx','source':'original','license':'original'}],'sources':[{'url':'https://example.org','claim':'source'}]}
  for name in ['scene.tsx','script.md','design.md','checks.md','handoff.md']:(self.folder/name).write_text('fixture')
 def tearDown(self):self.temp.cleanup()
 def load(self):
  (self.folder/'episode.json').write_text(json.dumps(self.spec))
  with patch.object(w,'EPISODES',self.root):return w.load('x')
 def test_intentional_silence_allowed(self):self.load()
 def test_science_source_required(self):
  self.spec['sources']=[]
  with self.assertRaisesRegex(ValueError,'sources'):self.load()
 def test_duplicate_scenes(self):
  self.spec['scenes']*=2
  with self.assertRaisesRegex(ValueError,'duplicate'):self.load()
 def test_asset_missing(self):
  self.spec['assets'][0]['path']='absent.svg'
  with self.assertRaisesRegex(ValueError,'asset'):self.load()
 def test_unsafe_asset(self):
  self.spec['assets'][0]['path']='../scene.tsx'
  with self.assertRaisesRegex(ValueError,'asset'):self.load()
 def test_bad_wav_rejected(self):
  folder,s=self.load();s['scenes'][0]['audio']='bad.wav';(folder/'bad.wav').write_text('not wave')
  with patch.object(w,'OUT',self.root/'output'):
   with self.assertRaisesRegex(ValueError,'Invalid PCM WAV'):w.speech(folder,s)
 def test_silent_import_rejected(self):
  folder,s=self.load();s['scenes'][0]['audio']='silent.wav'
  with w.wave.open(str(folder/'silent.wav'),'wb') as f:f.setparams((1,2,48000,0,'NONE','none'));f.writeframes(bytes(48000))
  with patch.object(w,'OUT',self.root/'output'):
   with self.assertRaises(ValueError):w.speech(folder,s)
 def test_budget_maximum(self):
  with patch.object(w,'CACHE',self.root):
   with self.assertRaisesRegex(ValueError,'budget'):w.budget(31_000_000_000)
if __name__=='__main__':unittest.main()

