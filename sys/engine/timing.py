"""Measure PCM WAV speech boundaries and build an audio-first timeline."""
import argparse,array,json,math,sys,wave
from pathlib import Path

RULES={'phrase':(.20,.15,.30),'sentence':(.35,.30,.50),'scene':(.50,.40,.70),'practice':(1.5,.8,3.),'visual':(3.,2.,4.)}
def measure(path):
    with wave.open(str(path)) as w:
        if w.getsampwidth()!=2:raise ValueError('Use PCM 16-bit WAV: '+str(path))
        rate=w.getframerate();channels=w.getnchannels();count=w.getnframes()
        samples=array.array('h',w.readframes(count))
        if sys.byteorder!='little':samples.byteswap()
    duration=count/rate;step=max(1,round(rate*.01))*channels;active=[]
    for i in range(0,len(samples),step):
        block=samples[i:i+step]
        rms=math.sqrt(sum(x*x for x in block)/len(block))/32768
        if rms>10**(-45/20):active.append((i/(rate*channels),min(len(samples),i+step)/(rate*channels)))
    if not active:raise ValueError('No audible speech candidate: '+str(path))
    internal=[b[0]-a[1] for a,b in zip(active,active[1:])]
    return duration,active[0][0],duration-active[-1][1],max(internal,default=0)

def build(spec,base):
    target=float(spec['targetSeconds']);fps=int(spec.get('fps',30))
    if not math.isfinite(target) or target<=0 or fps<=0:raise ValueError('Invalid target/fps')
    lead=float(spec.get('leadInSeconds',.15));tail=float(spec.get('tailSeconds',.30))
    if not 0<=lead<=.5 or not 0<=tail<=.5:raise ValueError('Lead/tail must be 0..0.5 seconds')
    phrases=spec['phrases']
    if not phrases:raise ValueError('At least one phrase is required')
    result=[];errors=[];cursor=lead;ids=set()
    measurements=[measure(base/p['audio']) for p in phrases]
    for i,(p,(duration,front,back,internal)) in enumerate(zip(phrases,measurements)):
        if not p.get('id') or p['id'] in ids:raise ValueError('Phrase IDs must be unique')
        ids.add(p['id'])
        if not p.get('sceneId') or not p.get('text'):raise ValueError('Missing sceneId/text')
        row={**p,'start':cursor,'end':cursor+duration,'speechStart':cursor+front,'speechEnd':cursor+duration-back,'internalSilenceMax':internal}
        if internal>.5:errors.append(f"{p['id']}: internal silence {internal:.3f}s; review take or split at an explicit boundary")
        cursor+=duration
        if i<len(phrases)-1:
            after=p.get('after',{'kind':'sentence'});kind=after['kind']
            if kind not in RULES:raise ValueError('Unknown boundary: '+kind)
            default,low,high=RULES[kind];desired=float(after.get('seconds',default))
            if not low<=desired<=high:raise ValueError('Pause outside policy range: '+p['id'])
            if kind=='practice' and (not after.get('reason') or not after.get('onScreenPrompt')):raise ValueError('Practice pause requires reason and onScreenPrompt')
            if kind=='visual' and (not after.get('reason') or not isinstance(after.get('actionIds'),list) or not after['actionIds'] or any(not isinstance(x,str) or not x for x in after['actionIds'])):raise ValueError('Visual pause requires reason and actionIds')
            embedded=back+measurements[i+1][1];padding=max(0,desired-embedded);actual=embedded+padding
            row['pauseAfter']={**after,'paddingSeconds':padding,'actualSeconds':actual}
            if actual>high+1e-6:errors.append(f"{p['id']}: actual boundary silence {actual:.3f}s exceeds {high}s")
            cursor+=padding
        result.append(row)
    duration=cursor+tail;delta=target-duration
    if abs(delta)>1/fps+1e-6:errors.append(f'Target mismatch {delta:+.3f}s: revise useful narration or explicit practice; do not pad silently')
    return {'targetSeconds':target,'fps':fps,'durationSeconds':duration,'deltaSeconds':delta,'phrases':result,'errors':errors,'valid':not errors}

def main():
    p=argparse.ArgumentParser();p.add_argument('input',type=Path);p.add_argument('--output',required=True,type=Path);a=p.parse_args()
    try:r=build(json.loads(a.input.read_text()),a.input.resolve().parent)
    except (ValueError,KeyError,TypeError,OSError,wave.Error) as e:print(str(e),file=sys.stderr);return 2
    a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(r,ensure_ascii=False,indent=2))
    print(json.dumps({'valid':r['valid'],'durationSeconds':r['durationSeconds'],'errors':r['errors']},ensure_ascii=False));return 0 if r['valid'] else 1
if __name__=='__main__':sys.exit(main())
