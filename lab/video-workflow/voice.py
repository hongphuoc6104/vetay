import json,sys,os,subprocess
from pathlib import Path
os.environ['HF_HUB_OFFLINE']='1'
import vieneu,numpy as np,soundfile as sf
s=json.loads(Path(sys.argv[1]).read_text());p=Path(s['output']);engine=vieneu.Vieneu(mode='v3turbo',backend='onnx',device='cpu',precision='fp32');a=engine.infer(s['text'],voice=engine.get_preset_voice('Adam'),temperature=.7)
if not np.isfinite(a).all() or np.max(np.abs(a))<.001:raise ValueError('Invalid generated audio')
raw=p.with_suffix('.raw.wav');sf.write(raw,a,engine.sample_rate,subtype='PCM_16');candidate=p.with_suffix('.tmp.wav')
subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-af','atempo=0.85','-ar','48000',str(candidate)],check=True);candidate.replace(p)
