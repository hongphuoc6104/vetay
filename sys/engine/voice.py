"""Local Adam voice helper. JSON phrases -> two cached takes, selection log, speech/timeline.
Usage: sys/.venv/bin/python sys/engine/voice.py sys/work/SLUG/narration.json
Input: {durationRange:[min,max], phrases:[{id,sceneId,text,role?,after?,take?}]}.
Existing raw/processed takes are preserved by content/profile hashes. Automatic selection
checks silence only; audition remains necessary for pronunciation and delivery.
"""
import os
import argparse,hashlib,json,subprocess,sys,shutil
from pathlib import Path
os.environ['HF_HOME']=str(Path(__file__).resolve().parents[2]/'sys/models')
os.environ['HF_HUB_OFFLINE']='1'
import numpy as np,soundfile as sf
from timing import measure,build

def run(input_path):
 base=input_path.resolve().parent;root=Path(__file__).resolve().parents[2]
 spec=json.loads(input_path.read_text());profile=json.loads((root/'sys/skill/cinematic-tutorial-video/references/adam-delivery.json').read_text())
 out=base/'audio';out.mkdir(exist_ok=True);engine=None;voice=None;rows=[];log=[]
 for index,p in enumerate(spec['phrases']):
  pid=p['id']
  if not pid or any(c not in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_' for c in pid):raise ValueError('Invalid phrase ID')
  speed=profile['speeds'].get(p.get('role','body'),1)
  key=hashlib.sha256(json.dumps([p['text'],profile,speed],ensure_ascii=False,sort_keys=True).encode()).hexdigest()[:12]
  candidates=[]
  for take,temp in enumerate(profile['temperatures'],1):
   raw=out/f'{pid}-{key}-raw-{take}.wav';processed=out/f'{pid}-{key}-take-{take}.wav'
   if not raw.exists():
    if engine is None:
     import vieneu
     engine=vieneu.Vieneu(mode='v3turbo',backend='onnx',device='cpu',precision='fp32');voice=engine.get_preset_voice('Adam')
    print('SYNTH',index+1,len(spec['phrases']),pid,take,flush=True)
    sf.write(raw,engine.infer(p['text'],voice=voice,temperature=temp,silence_p=profile['silence_p']),engine.sample_rate,subtype='PCM_16')
   trimmed=out/f'{pid}-{key}-trim-{take}.wav'
   if not processed.exists() or not trimmed.exists():
    filt=profile['eq']+(f',atempo={speed}' if speed!=1 else '')
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(raw),'-af',filt,'-ar','48000','-c:a','pcm_s16le',str(processed)],check=True)
    # Preserve raw and processed audio; trim only detected exterior silence, leaving 30ms margins.
    duration,front,back,internal=measure(processed)
    data,rate=sf.read(processed);trimmed=out/f'{pid}-{key}-trim-{take}.wav'
    start=max(0,round((front-.03)*rate));end=min(len(data),round((duration-back+.03)*rate))
    sf.write(trimmed,data[start:end],rate,subtype='PCM_16')
   trimmed=out/f'{pid}-{key}-trim-{take}.wav';m=measure(trimmed)
   candidates.append({'take':take,'audio':str(trimmed.relative_to(base)),'duration':m[0],'front':m[1],'back':m[2],'internalSilence':m[3]})
  valid=[c for c in candidates if c['internalSilence']<=.5]
  if p.get('take'):valid=[c for c in valid if c['take']==p['take']]
  if not valid:raise ValueError(f'{pid}: candidates need listening/revision; internal silence too long')
  selected=min(valid,key=lambda x:(x['internalSilence'],x['take']))
  row={k:v for k,v in p.items() if k not in ['role','take']};row['audio']=selected['audio'];rows.append(row)
  log.append({'id':pid,'text':p['text'],'selected':selected['take'],'candidates':candidates,'selectionBasis':'silence measurement; auditory quality not automatically verified'})
  (base/'takes.json').write_text(json.dumps(log,ensure_ascii=False,indent=2))
  print('SELECT',pid,selected['take'],round(selected['duration'],3),flush=True)
 speech={'targetSeconds':spec.get('targetSeconds',1),'fps':30,'leadInSeconds':.15,'tailSeconds':.3,'phrases':rows}
 first=build(speech,base)
 if 'targetSeconds' not in spec:speech['targetSeconds']=round(first['durationSeconds']*30)/30
 timeline=build(speech,base)
 if 'durationRange' in spec and not spec['durationRange'][0]<=timeline['targetSeconds']<=spec['durationRange'][1]:
  timeline['errors'].append('Outside editorial duration range; revise meaningful content');timeline['valid']=False
 (base/'speech.json').write_text(json.dumps(speech,ensure_ascii=False,indent=2));(base/'timeline.json').write_text(json.dumps(timeline,ensure_ascii=False,indent=2))
 print('TIMELINE',timeline['targetSeconds'],timeline['errors'],flush=True)
 if not timeline['valid']:raise ValueError('Revise takes/content before production')
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('input',type=Path);run(ap.parse_args().input)
