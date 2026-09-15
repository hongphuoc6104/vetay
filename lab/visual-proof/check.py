import json,subprocess,hashlib
from pathlib import Path
out=Path(__file__).resolve().parents[3]/'video-lab-cache/trials/visual-proof'
report={}
for name in ['mirror','pump']:
 p=out/(name+'.mp4')
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]));v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
 assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1080,1920,'30/1',660)
 assert abs(float(probe['format']['duration'])-22)<.05
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
 report[name]={'duration':22,'frames':660,'width':1080,'height':1920,'fps':30,'audio':a['codec_name'],'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'full_decode':'pass','frame_review':'contact sheets and key frames','full_speed_playback_review':False,'auditory_review':False,'render':json.loads((out/(name+'-metrics.json')).read_text())}
(out/'checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,indent=2))
