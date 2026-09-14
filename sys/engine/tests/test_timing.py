import importlib.util,tempfile,unittest,wave,array,math
from pathlib import Path
s=importlib.util.spec_from_file_location('timing',Path(__file__).resolve().parents[1]/'timing.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class TimingTests(unittest.TestCase):
 def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
 def tearDown(self):self.tmp.cleanup()
 def wav(self,name,front=0,back=0):
  sr=16000;a=[0]*round(front*sr)+[int(5000*math.sin(2*math.pi*220*i/sr)) for i in range(sr)]+[0]*round(back*sr)
  with wave.open(str(self.root/name),'wb') as w:w.setparams((1,2,sr,0,'NONE','not compressed'));w.writeframes(array.array('h',a).tobytes())
 def spec(self,after=None):return {'targetSeconds':2.8,'phrases':[{'id':'a','sceneId':'s','text':'A','audio':'a.wav','after':after or {'kind':'sentence'}},{'id':'b','sceneId':'s','text':'B','audio':'b.wav'}]}
 def test_sequential_and_embedded_pause(self):
  self.wav('a.wav',back=.1);self.wav('b.wav',front=.1);r=m.build(self.spec(),self.root)
  self.assertTrue(r['valid']);self.assertAlmostEqual(r['phrases'][0]['pauseAfter']['actualSeconds'],.35);self.assertAlmostEqual(r['phrases'][1]['speechStart']-r['phrases'][0]['speechEnd'],.35)
 def test_hidden_long_pause_rejected(self):
  self.wav('a.wav',back=.8);self.wav('b.wav');r=m.build(self.spec(),self.root);self.assertFalse(r['valid']);self.assertTrue(any('boundary silence' in e for e in r['errors']))
 def test_practice_requires_visible_instruction(self):
  self.wav('a.wav');self.wav('b.wav')
  with self.assertRaises(ValueError):m.build(self.spec({'kind':'practice'}),self.root)
 def test_target_not_filled_with_silence(self):
  self.wav('a.wav');self.wav('b.wav');s=self.spec();s['targetSeconds']=30;r=m.build(s,self.root);self.assertFalse(r['valid']);self.assertLess(r['durationSeconds'],3)
 def test_exact_thirty_second_schedule(self):
  self.wav('a.wav');phrases=[{'id':str(i),'sceneId':'s','text':'A','audio':'a.wav','after':{'kind':'sentence','seconds':.3595238095238095}} for i in range(22)]
  r=m.build({'targetSeconds':30,'phrases':phrases},self.root)
  self.assertTrue(r['valid']);self.assertAlmostEqual(r['durationSeconds'],30)
if __name__=='__main__':unittest.main()
