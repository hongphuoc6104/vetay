import os,json,sys,hashlib,time,subprocess
from pathlib import Path
os.environ['HF_HUB_OFFLINE']='1'
import soundfile as sf
import numpy as np
spec=json.loads(Path(sys.argv[1]).read_text());out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
engine=None;rows=[]
for s in spec['scenes']:
 key=hashlib.sha256(('adam-v3turbo-fp32-temp0.7-speed0.85-v2'+s['text']).encode()).hexdigest()[:20]
 p=out/(key+'.wav');start=time.monotonic()
 if s.get('audio'):p=Path(s['audio']).resolve()
 if not p.exists():
  if engine is None:
   import vieneu
   engine=vieneu.Vieneu(mode='v3turbo',backend='onnx',device='cpu',precision='fp32');voice=engine.get_preset_voice('Adam')
  audio=engine.infer(s['text'],voice=voice,temperature=.7)
  if not np.isfinite(audio).all() or np.max(np.abs(audio))<.001:raise ValueError('Invalid audio')
  raw=p.with_suffix('.raw.wav');sf.write(raw,audio,engine.sample_rate,subtype='PCM_16')
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-af','atempo=0.85','-ar','48000',str(p)],check=True)
 info=sf.info(str(p));rows.append({'path':str(p),'seconds':info.duration,'work_seconds':time.monotonic()-start})
 print(s['id'],round(info.duration,2),flush=True)
(out/(spec['id']+'.json')).write_text(json.dumps(rows,ensure_ascii=False,indent=2))
