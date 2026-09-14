"""Assemble validated per-phrase audio, then normalize a narration master."""
import argparse,json,subprocess
from pathlib import Path
import numpy as np,soundfile as sf
def main():
 p=argparse.ArgumentParser();p.add_argument('speech',type=Path);p.add_argument('timeline',type=Path);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
 spec=json.loads(a.speech.read_text());timeline=json.loads(a.timeline.read_text())
 if not timeline.get('valid'):raise ValueError('Invalid timeline')
 sr=48000;master=np.zeros(round(timeline['targetSeconds']*sr))
 for row in timeline['phrases']:
  data,rate=sf.read(a.speech.parent/row['audio']);data=data.mean(axis=1) if data.ndim>1 else data
  if rate!=sr:raise ValueError('Expected 48kHz final-speed WAV')
  start=round(row['start']*sr)
  if start+len(data)>len(master):raise ValueError('Audio exceeds target')
  master[start:start+len(data)]+=data
 a.output.parent.mkdir(parents=True,exist_ok=True);raw=a.output.with_name(a.output.stem+'-raw.wav');sf.write(raw,master,sr,subtype='PCM_16')
 filt='loudnorm=I=-15.5:TP=-2.5:LRA=7'
 measure=subprocess.run(['ffmpeg','-hide_banner','-i',str(raw),'-af',filt+':print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
 stats=json.loads(measure.stderr[measure.stderr.rfind('{'):measure.stderr.rfind('}')+1]);filt+=f":measured_I={stats['input_i']}:measured_TP={stats['input_tp']}:measured_LRA={stats['input_lra']}:measured_thresh={stats['input_thresh']}:offset={stats['target_offset']}:linear=true"
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(raw),'-af',filt,'-ar',str(sr),'-c:a','pcm_s16le',str(a.output)],check=True)
if __name__=='__main__':main()
