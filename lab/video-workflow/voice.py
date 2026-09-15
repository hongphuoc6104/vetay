"""Offline voice worker. Unknown presets fail rather than silently changing identity."""
import json,sys,os,subprocess
from pathlib import Path
os.environ['HF_HUB_OFFLINE']='1'
import vieneu,numpy as np,soundfile as sf
from voice_config import resolve_voice
s=json.loads(Path(sys.argv[1]).read_text());p=Path(s['output']);profile=resolve_voice(s)
engine=vieneu.Vieneu(mode='v3turbo',backend='onnx',device='cpu',precision='fp32')
voice=engine.get_preset_voice(profile['preset'])
a=engine.infer(s['text'],voice=voice,temperature=profile['temperature'])
if not np.isfinite(a).all() or not a.size or np.max(np.abs(a))<.001:raise ValueError('Invalid generated audio')
raw=p.with_suffix('.raw.wav');candidate=p.with_suffix('.tmp.wav')
try:
 sf.write(raw,a,engine.sample_rate,subtype='PCM_16')
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-af',f"atempo={profile['speed']},loudnorm=I=-18:TP=-2:LRA=7",'-ar','48000','-ac','1','-c:a','pcm_s16le',str(candidate)],check=True)
 candidate.replace(p)
finally:
 raw.unlink(missing_ok=True);candidate.unlink(missing_ok=True)
