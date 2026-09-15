"""Versioned local voice profiles; displayed text stays independent from pronunciation."""
import hashlib,json,math
DEFAULT={'preset':'Adam','speed':0.85,'temperature':0.7,'dictionary':{},'version':1}
def resolve_voice(episode):
 profile=dict(DEFAULT,**episode.get('voice',{}))
 if not isinstance(profile['preset'],str) or not profile['preset'].strip():raise ValueError('Voice preset required')
 for key,low,high in [('speed',.85,1.1),('temperature',.1,1.0)]:
  value=profile[key]
  if not isinstance(value,(int,float)) or not math.isfinite(value) or not low<=value<=high:raise ValueError('Invalid voice '+key)
 if not isinstance(profile['dictionary'],dict) or any(not isinstance(k,str) or not k or not isinstance(v,str) for k,v in profile['dictionary'].items()):raise ValueError('Invalid pronunciation dictionary')
 return profile

def spoken_text(scene,profile):
 text=scene.get('spoken_text',scene['text'])
 if not isinstance(text,str) or (scene['text'].strip() and not text.strip()):raise ValueError('Spoken text cannot omit narration')
 for term,value in sorted(profile['dictionary'].items(),key=lambda item:-len(item[0])):text=text.replace(term,value)
 return text

def speech_key(text,profile,engine_revision):
 return hashlib.sha256(json.dumps({'text':text,'profile':profile,'engine':engine_revision},ensure_ascii=False,sort_keys=True).encode()).hexdigest()
