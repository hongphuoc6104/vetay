import unittest,tempfile,json
from pathlib import Path
from visual_contract import validate_visual,review_times,require_review
class VisualTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup);self.p=Path(self.tmp.name)
  self.s={'visual_version':1,'domain':'story','scenes':[{'id':'one'}],'assets':[{'path':'scene.tsx'}]}
  self.v=dict(intent='intent',alternatives=['A','B'],chosen_direction='A',selection_reason='clear',art_direction='ink',shots=[dict(id='shot',scene='one',start=0,end=1,subject='person',action='turn',camera='close',new_information='recognition',transition='cut',layers='three',lighting='window',assets=['scene.tsx'])],checkpoints=[dict(id=str(i),shot='shot',at=i/2,check='contact') for i in range(3)])
  (self.p/'direction.md').write_text('Direction')
 def save(self):
  (self.p/'visual.json').write_text(json.dumps(self.v));return validate_visual(self.p,self.s)
 def test_valid(self):self.assertEqual(self.save(),self.v)
 def test_legacy(self):self.assertIsNone(validate_visual(self.p,{}))
 def test_unknown_asset(self):
  self.v['shots'][0]['assets']=['missing'];self.assertRaises(ValueError,self.save)
 def test_gap(self):
  self.v['shots'][0]['start']=.1;self.assertRaises(ValueError,self.save)
 def test_nan(self):
  self.v['checkpoints'][0]['at']=float('nan');self.assertRaises(ValueError,self.save)
 def test_missing_shot(self):
  self.v['checkpoints'][0]['shot']='bad';self.assertRaises(ValueError,self.save)
 def test_science(self):
  self.s['domain']='science';self.assertRaises(ValueError,self.save)
 def test_timing(self):
  marks=review_times(self.v,{'duration':20,'scenes':[{'id':'one','start':0,'duration':20}]},30)
  self.assertEqual(marks[1]['time'],10);self.assertLess(marks[-1]['time'],20)
 def test_review_gate(self):
  d=self.p/'visual-review';d.mkdir();r=dict(input_digest='a',video_digest='v',checks=[dict(id=str(i),status='pass',note='observed') for i in range(3)],rough_watched=True,rough_watch_note='viewed')
  (d/'review.json').write_text(json.dumps(r));require_review(self.p,'a','v',self.v)
  self.assertRaises(ValueError,require_review,self.p,'b','v',self.v)
  r['checks'][0]['status']='pending';(d/'review.json').write_text(json.dumps(r));self.assertRaises(ValueError,require_review,self.p,'a','v',self.v)
if __name__=='__main__':unittest.main()
