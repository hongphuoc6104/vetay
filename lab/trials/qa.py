#!/usr/bin/env python3
"""Bounded, sequential QA; output stays in shared cache. No audience/audio claims."""
import argparse,json,math,re,subprocess,tempfile
from pathlib import Path
from fractions import Fraction
from PIL import Image,ImageDraw,ImageFont
HERE=Path(__file__).resolve().parent
DEFAULT=HERE.parents[2]/'video-lab-cache'/'trials'
def command(args):
 p=subprocess.run(args,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 return p.returncode,p.stdout,p.stderr

def inspect(folder,kind='preview',decode=True):
 folder=Path(folder);result={'episode':folder.name,'kind':kind,'checks':[],'warnings':[],'limitations':['Caption timing is estimated by character length, not forced alignment.','Font bounds are conservative approximations; contact sheet requires visual review.','Numeric audio checks do not constitute listening or speech quality assessment.']}
 def check(name,ok,detail):result['checks'].append({'name':name,'pass':bool(ok),'detail':detail})
 prepared=folder/'prepared.json';video=folder/(kind+'.mp4')
 if not prepared.exists() or not video.exists():
  result['status']='pending';result['missing']=[str(p) for p in (prepared,video) if not p.exists()];return result
 e=json.loads(prepared.read_text());expected=e['frames']/e['fps']
 result['video_signature']={'bytes':video.stat().st_size,'mtime_ns':video.stat().st_mtime_ns}
 if e.get('style') in ['vector','sketch','kenney'] and folder.name!='benchmark' and expected<45:result['warnings'].append('Below planned 45-second discovery duration; assess whether story needs more development.')
 rc,out,err=command(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)])
 if rc:result.update(status='incomplete_or_invalid',error=err);return result
 probe=json.loads(out);v=next((s for s in probe['streams'] if s['codec_type']=='video'),{});a=next((s for s in probe['streams'] if s['codec_type']=='audio'),{})
 size=(540,960) if kind=='preview' else (1080,1920)
 check('portrait_dimensions',(v.get('width'),v.get('height'))==size,{'expected':size,'actual':[v.get('width'),v.get('height')]})
 check('fps',abs(float(Fraction(v.get('avg_frame_rate','0/1')))-30)<.001,v.get('avg_frame_rate'))
 actual=float(probe['format']['duration']);check('duration',abs(actual-expected)<.12,{'expected':expected,'actual':actual})
 check('audio_present',bool(a),{'codec':a.get('codec_name'),'channels':a.get('channels')})
 font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',48)
 cursor=0;issues=[];layout=[];caption_count=0
 for s in e['scenes']:
  if s['from']!=cursor:issues.append(s['id']+': noncontiguous timeline')
  if s.get('voiceFrames',0)>s['frames']:issues.append(s['id']+': voice beyond scene')
  last=0
  for c in s.get('captions',[]):
   caption_count+=1
   if not (0<=c['start']<c['end']<=s['frames']/30+.001) or c['start']<last-.001:issues.append(s['id']+': caption timing invalid')
   last=c['end'];lines=['']
   for word in c['text'].split():
    if font.getlength(word)>885:layout.append({'scene':s['id'],'text':word,'reason':'single word exceeds width'})
    trial=(lines[-1]+' '+word).strip()
    if lines[-1] and font.getlength(trial)>885:lines.append(word)
    else:lines[-1]=trial
   if 1450+len(lines)*48*1.35>1789:layout.append({'scene':s['id'],'text':c['text'],'reason':'estimated caption overlaps progress bar'})
  if ' '.join(c['text'] for c in s.get('captions',[]))!=' '.join(s['text'].split()):issues.append(s['id']+': caption text differs from narration')
  cursor+=s['frames']
 check('timeline_and_caption_bounds',not issues and cursor==e['frames'],{'issues':issues,'captions':caption_count})
 check('estimated_caption_layout',not layout,layout)
 srt=folder/'subtitles.srt'
 blocks=re.split(r'\n\s*\n',srt.read_text().strip()) if srt.exists() else []
 check('srt_caption_count',len(blocks)==caption_count,{'expected':caption_count,'actual':len(blocks)})
 if decode:
  rc,out,err=command(['ffmpeg','-v','error','-threads','1','-i',str(video),'-map','0:v','-map','0:a?','-f','null','-'])
  check('full_decode',rc==0 and not err.strip(),err[-2000:])
 if a:
  rc,out,err=command(['ffmpeg','-hide_banner','-nostats','-threads','1','-i',str(video),'-vn','-af','volumedetect,silencedetect=noise=-45dB:d=0.5','-f','null','-'])
  levels={k:float(value) for k,value in re.findall(r'(mean_volume|max_volume):\s*([-\d.]+) dB',err)}
  silence=sum(float(x) for x in re.findall(r'silence_duration:\s*([\d.]+)',err));result['audio_signal']={**levels,'silence_seconds':silence,'silence_threshold_db':-45,'silence_min_seconds':.5}
  if silence/max(actual,.001)>.35:result['warnings'].append('More than 35% detected silence; assess pacing, not necessarily an audio defect.')
  check('audio_not_effectively_silent',rc==0 and levels.get('max_volume',-100)>-45 and silence/max(actual,.001)<.98,result['audio_signal'])
 times=[(s['from']+s['frames']*.55)/30 for s in e['scenes']]
 if len(times)>12:times=[times[round(i*(len(times)-1)/11)] for i in range(12)]
 qa=folder/'qa';qa.mkdir(exist_ok=True);sheet=Image.new('RGB',(3*270,math.ceil(len(times)/3)*510),'#dddddd');draw=ImageDraw.Draw(sheet)
 for i,t in enumerate(times):
  with tempfile.TemporaryDirectory(dir=qa) as tmp:
   image=Path(tmp)/'frame.png';rc,out,err=command(['ffmpeg','-v','error','-threads','1','-ss',str(t),'-i',str(video),'-frames:v','1','-vf','scale=270:480','-threads','1',str(image)])
   if rc==0:
    with Image.open(image) as im:sheet.paste(im.convert('RGB'),((i%3)*270,(i//3)*510))
   else:check('frame_extract_'+str(i),False,err[-500:])
  draw.text(((i%3)*270+5,(i//3)*510+483),f'{t:.2f}s',fill='black')
 contact=qa/(kind+'-contact.jpg');sheet.save(contact,quality=87);result['contact_sheet']=str(contact)
 result['status']='pass_automated_checks' if all(c['pass'] for c in result['checks']) else 'fail'
 result['visual_review']='representative contact sheet requires inspection; full-speed review not performed';return result

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('episodes',nargs='*');p.add_argument('--root',type=Path,default=DEFAULT);p.add_argument('--kind',choices=['preview','final','both'],default='both');p.add_argument('--skip-decode',action='store_true');args=p.parse_args()
 folders=[args.root/x for x in args.episodes] if args.episodes else sorted(p.parent for p in args.root.glob('*/prepared.json'))
 results=[]
 for folder in folders:
  for kind in (['preview','final'] if args.kind=='both' else [args.kind]):
   result=inspect(folder,kind,not args.skip_decode);results.append(result)
   if folder.exists():(folder/('qa-'+kind+'.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2))
   print(folder.name,kind,result['status'],flush=True)
 (args.root/'qa-summary.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
 return 1 if any(r['status'] in ['fail','incomplete_or_invalid'] for r in results) else 0
if __name__=='__main__':raise SystemExit(main())
