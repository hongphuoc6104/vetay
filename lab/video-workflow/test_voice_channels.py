import json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import workflow as w
from voice_config import resolve_voice,spoken_text,speech_key
class VoiceChannels(unittest.TestCase):
 def test_display_text_preserved(self):
  scene={'text':'Tần số 20 Hz.','spoken_text':'Tần số hai mươi héc.'}
  self.assertEqual(spoken_text(scene,resolve_voice({})),'Tần số hai mươi héc.')
  self.assertEqual(scene['text'],'Tần số 20 Hz.')
 def test_narration_without_subtitles_not_silenced(self):
  import wave
  with tempfile.TemporaryDirectory() as d,patch.object(w,'OUT',Path(d)):
   def generate(*args,**kwargs):
    spec=json.loads(Path(args[0][-1]).read_text())
    with wave.open(spec['output'],'wb') as f:
     f.setparams((1,2,48000,0,'NONE','none'));f.writeframes(b'\x00\x01'*48000)
   with patch.object(w.subprocess,'run',side_effect=generate):
    rows=w.speech(Path(d),{'scenes':[{'text':'','spoken_text':'Có lời kể.'}]})
   self.assertEqual(rows[0]['duration'],1)
   self.assertNotEqual(Path(rows[0]['path']).name,'silence.wav')
 def test_profile_and_engine_invalidate_cache(self):
  a=resolve_voice({});b=dict(a,preset='Trúc Ly')
  self.assertNotEqual(speech_key('a',a,'v1'),speech_key('a',b,'v1'))
  self.assertNotEqual(speech_key('a',a,'v1'),speech_key('a',a,'v2'))
 def test_voice_limits(self):
  for speed in [2,float('nan'),0]:
   with self.assertRaises(ValueError):resolve_voice({'voice':{'speed':speed}})
 def test_channel_output_isolation(self):
  self.assertNotEqual(w.destination({'id':'same','_channel_id':'science'}),w.destination({'id':'same','_channel_id':'storytelling'}))
 def test_pause_preserves_audio_space(self):
  s={'duration':10,'fps':30,'scenes':[{'id':'a','text':'x','seconds':4,'pause_before':1,'pause_after':1},{'id':'b','text':'y','seconds':6}]}
  t=w.schedule(s,[4,1]);self.assertGreaterEqual(t['scenes'][0]['duration'],6)
  c=w.captions(t,[{'duration':4},{'duration':1}]);self.assertEqual(c[0]['start'],1)
 def test_profile_change_invalidates_readiness(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);p=root/'episodes'/'x';p.mkdir(parents=True);(p/'scene.tsx').write_text('x')
   cfg=root/'channel.json';cfg.write_text('{}');a=w.fingerprint(p);cfg.write_text('{"voice":1}');self.assertNotEqual(a,w.fingerprint(p))
 def test_path_escape_rejected(self):
  with self.assertRaises(ValueError):w.episode_folder('channels/../../outside/episodes/x')
if __name__=='__main__':unittest.main()
