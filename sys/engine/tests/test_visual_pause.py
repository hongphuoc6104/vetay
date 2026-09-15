import unittest
import test_timing
m=test_timing.m
class VisualPauseTests(unittest.TestCase):
 setUp=test_timing.TimingTests.setUp
 tearDown=test_timing.TimingTests.tearDown
 wav=test_timing.TimingTests.wav
 spec=test_timing.TimingTests.spec
 def test_visual_pause_measures_embedded_silence(self):
  self.wav('a.wav',back=.1);self.wav('b.wav',front=.1)
  spec=self.spec({'kind':'visual','seconds':3,'reason':'Draw evidence','actionIds':['support']});spec['targetSeconds']=5.45
  r=m.build(spec,self.root);self.assertTrue(r['valid']);self.assertAlmostEqual(r['phrases'][1]['speechStart']-r['phrases'][0]['speechEnd'],3)
 def test_visual_pause_needs_action_and_reason(self):
  self.wav('a.wav');self.wav('b.wav')
  for after in [{'kind':'visual'},{'kind':'visual','reason':'draw','actionIds':[]},{'kind':'visual','reason':'draw','actionIds':['x'],'seconds':5}]:
   with self.assertRaises(ValueError):m.build(self.spec(after),self.root)
