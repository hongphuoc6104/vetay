import json,os,subprocess,wave,math,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parent
OUT=ROOT.parents[2]/'video-lab-cache/trials/visual-proof'
OUT=OUT.resolve();OUT.mkdir(parents=True,exist_ok=True)
lines={'mirror':[(0,3,'Đêm đó, chiếc gương chậm hơn tôi một nhịp.'),(7,11,'Tôi hạ tay. Nó mới chịu hạ.'),(11,15,'Rồi tôi quay đi.'),(16,20,'Nhưng nó… vẫn đứng đó.')],'pump':[(0,3,'Bơm xe đẩy khí vào lốp bằng cách nào?'),(3.2,7,'Kéo lên: khí ngoài đi vào.'),(7.2,12,'Ấn xuống: khí bị nén, áp suất tăng.'),(12.1,16,'Đủ áp suất, khí qua van vào lốp.'),(16.1,20.6,'Van một chiều ngăn khí chạy ngược về bơm.')]}
for name,rows in lines.items():
 spec={'id':name,'scenes':[{'id':str(i),'text':s} for i,(_,__,s) in enumerate(rows)]};p=OUT/(name+'-speech.json');p.write_text(json.dumps(spec,ensure_ascii=False))
 env=os.environ.copy();env.update(HF_HOME=str(ROOT.parents[2]/'vetay/sys/models'),HF_HUB_OFFLINE='1',OMP_NUM_THREADS='2',OPENBLAS_NUM_THREADS='2')
 subprocess.run([str(ROOT.parents[2]/'vetay/sys/.venv/bin/python'),str(ROOT.parent/'trials/tts.py'),str(p),str(OUT/'audio')],env=env,check=True)
 manifest=json.loads((OUT/'audio'/f'{name}.json').read_text());inputs=[];filters=[];caps=[]
 for i,((start,end,txt),a) in enumerate(zip(rows,manifest)):
  if a['seconds']>end-start: print('OVERLONG',name,i,a['seconds'],end-start)
  inputs+=['-i',a['path']];filters.append(f'[{i}:a]adelay={round(start*1000)}:all=1[a{i}]');caps.append({'start':start,'end':min(22,start+a['seconds']),'text':txt})
 # quiet generated ambience and impact sound, stereo not needed
 sr=48000;sound=[]
 for k in range(22*sr):
  t=k/sr;v=.006*math.sin(2*math.pi*(55 if name=='mirror' else 90)*t)
  events=[3.8,20.3,20.7] if name=='mirror' else [3,7,12,16]
  for e in events:
   d=t-e
   if 0<=d<.25:v+=.07*math.exp(-d*25)*math.sin(2*math.pi*(1200 if name=='mirror' else 230)*d)
  sound.append(int(max(-1,min(1,v))*32767))
 fx=OUT/(name+'-fx.wav')
 with wave.open(str(fx),'wb') as w:w.setparams((1,2,sr,0,'NONE','none'));w.writeframes(struct.pack('<'+'h'*len(sound),*sound))
 inputs+=['-i',str(fx)];filters.append(''.join(f'[a{i}]' for i in range(len(rows)))+f'[{len(rows)}:a]amix=inputs={len(rows)+1}:normalize=0,alimiter=limit=0.9,apad[out]')
 subprocess.run(['ffmpeg','-v','error','-y',*inputs,'-filter_complex',';'.join(filters),'-map','[out]','-t','22','-ar','48000',str(OUT/(name+'.wav'))],check=True)
 (ROOT/(name+'-captions.json')).write_text(json.dumps(caps,ensure_ascii=False,indent=2))
 def stamp(t):
  ms=round(t*1000);return f'00:00:{ms//1000:02d},{ms%1000:03d}'
 (OUT/(name+'.srt')).write_text('\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(caps)))
