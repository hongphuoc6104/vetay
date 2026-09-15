"""Versioned visual preparation; structural checks never certify aesthetics."""
import json, math
from pathlib import Path

def require(value, message):
    if not value: raise ValueError('Visual preparation: '+message)

def validate_visual(folder, spec):
    if 'visual_version' not in spec: return None
    require(spec['visual_version']==1, 'unsupported version')
    path=folder/'visual.json'
    require(path.is_file(), 'missing visual.json')
    v=json.loads(path.read_text())
    require((folder/'direction.md').is_file(), 'missing direction.md')
    for field in ['intent','chosen_direction','selection_reason','art_direction']:
        require(isinstance(v.get(field),str) and v[field].strip(), 'missing '+field)
    require(isinstance(v.get('alternatives'),list) and len(v['alternatives'])==2 and all(isinstance(x,str) and x.strip() for x in v['alternatives']), 'two directions required')
    scenes={x['id'] for x in spec['scenes']}
    shots=v.get('shots',[]); require(bool(shots), 'shots required')
    ids=set()
    for shot in shots:
        sid=shot.get('id','')
        require(isinstance(sid,str) and sid and sid.replace('-','').replace('_','').isalnum() and sid not in ids, 'invalid/duplicate shot ID'); ids.add(sid)
        require(shot.get('scene') in scenes, 'unknown scene')
        for k in ['subject','action','camera','new_information','transition','layers','lighting']:
            require(isinstance(shot.get(k),str) and shot[k].strip(), 'shot missing '+k)
        start,end=shot.get('start'),shot.get('end')
        require(all(type(n) in (int,float) and math.isfinite(n) for n in [start,end]) and 0<=start<end<=1, 'shot range must be relative 0..1')
        refs=shot.get('assets')
        require(isinstance(refs,list) and all(p in [a['path'] for a in spec['assets']] for p in refs), 'unknown shot asset')
        if spec['domain']=='science':
            require(shot.get('representation') in ['illustration','simplified-model','data'], 'science representation required')
            require(isinstance(shot.get('limitations'),str) and shot['limitations'].strip(), 'science limitations required')
    require({x['scene'] for x in shots}==scenes, 'shots must cover every scene')
    for scene in scenes:
        ranges=sorted((x['start'],x['end']) for x in shots if x['scene']==scene)
        cursor=0
        for start,end in ranges:
            require(abs(start-cursor)<1e-6, 'shot gap/overlap');cursor=end
        require(abs(cursor-1)<1e-6, 'incomplete scene coverage')
    marks=v.get('checkpoints',[]);require(len(marks)>=3, 'at least three checkpoints required')
    seen=set()
    for m in marks:
        mid=m.get('id','')
        require(isinstance(mid,str) and mid and mid.replace('-','').replace('_','').isalnum() and mid not in seen,'invalid/duplicate checkpoint');seen.add(mid)
        require(m.get('shot') in ids, 'unknown checkpoint shot')
        require(type(m.get('at')) in (float,int) and math.isfinite(m['at']) and 0<=m['at']<=1,'checkpoint at must be relative 0..1')
        require(isinstance(m.get('check'),str) and m['check'].strip(), 'checkpoint criterion required')
    require({m['shot'] for m in marks}==ids, 'each shot needs a checkpoint')
    return v

def review_times(visual,timeline,fps):
    scenes={x['id']:x for x in timeline['scenes']};shots={x['id']:x for x in visual['shots']}
    result=[]
    for m in visual['checkpoints']:
        shot=shots[m['shot']];scene=scenes[shot['scene']]
        t=scene['start']+scene['duration']*(shot['start']+(shot['end']-shot['start'])*m['at'])
        result.append(dict(m,time=min(t,timeline['duration']-1/fps)))
    return result

def require_review(dest, fingerprint, video_digest, visual):
    p=dest/'visual-review'/'review.json';require(p.is_file(),'run visual-review and inspect frames')
    r=json.loads(p.read_text())
    require(r.get('input_digest')==fingerprint and r.get('video_digest')==video_digest,'stale visual review')
    checks=r.get('checks',[])
    require(len(checks)==len(visual['checkpoints']) and {x.get('id') for x in checks}=={x['id'] for x in visual['checkpoints']},'review coverage mismatch')
    require(all(x.get('status')=='pass' and isinstance(x.get('note'),str) and x['note'].strip() for x in checks),'visual checks pending/failed; inspect and record observations')
    require(r.get('rough_watched') is True and bool(r.get('rough_watch_note','').strip()),'watch complete rough and record observation')
