#!/usr/bin/env python3
"""Locked, resumable asset downloads. Python standard library only."""
import argparse, hashlib, json, os, shutil, stat, sys, tarfile, time, urllib.request, zipfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
CACHE = Path(os.environ.get('VIDEO_LAB_CACHE', str(ROOT.parent / 'video-lab-cache'))).resolve()
LIMIT = 30_000_000_000
RESERVE = 20_000_000_000

def size(path):
    return sum(p.stat().st_size for p in path.rglob('*') if p.is_file() and not p.is_symlink()) if path.exists() else 0

def budget(extra=0):
    CACHE.mkdir(parents=True, exist_ok=True)
    used = size(CACHE)
    if used + extra > LIMIT or shutil.disk_usage(CACHE).free - extra < RESERVE:
        raise RuntimeError(f'Disk budget exceeded: used={used}, extra={extra}, limit={LIMIT}')
    return used

def sha(path):
    h = hashlib.sha256()
    with open(path,'rb') as f:
        for b in iter(lambda:f.read(1024*1024), b''): h.update(b)
    return h.hexdigest()

def request(url, **kw):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'video-lab/1.0', **kw}), timeout=60)

def target(relative):
    p = (CACHE / relative).resolve()
    if not p.is_relative_to(CACHE): raise ValueError('Path outside cache')
    return p

def download(entry):
    dest = target(entry['file']); dest.parent.mkdir(parents=True,exist_ok=True)
    if dest.exists():
        if entry.get('sha256') and sha(dest) != entry['sha256']: raise RuntimeError(f'Checksum mismatch: {dest}')
        return dest
    part=dest.with_name(dest.name+'.part')
    maximum=entry.get('max_download_bytes',1_000_000_000)
    for attempt in range(4):
        try:
            offset=part.stat().st_size if part.exists() else 0
            with request(entry['url'], **({'Range':f'bytes={offset}-'} if offset else {})) as r:
                append=bool(offset and r.status==206)
                if append and not r.headers.get('Content-Range','').startswith(f'bytes {offset}-'):
                    raise RuntimeError('Unexpected Content-Range')
                total=int(r.headers.get('Content-Length',0))+(offset if append else 0)
                if total>maximum: raise RuntimeError('Download exceeds per-file limit')
                budget(max(0,total-offset))
                count=offset if append else 0
                with open(part,'ab' if append else 'wb') as f:
                    while True:
                        b=r.read(1024*1024)
                        if not b: break
                        count+=len(b)
                        if count>maximum: raise RuntimeError('Download exceeds per-file limit')
                        budget(len(b)); f.write(b)
                if total and count!=total: raise IOError('Truncated download')
            if entry.get('sha256') and sha(part)!=entry['sha256']: raise RuntimeError('Checksum mismatch; partial retained for inspection')
            part.rename(dest); return dest
        except (OSError, urllib.error.URLError):
            if attempt==3: raise
            time.sleep(attempt+1)

def extract(entry,path):
    if not entry.get('extract_to'): return
    out=target(entry['extract_to']); marker=out/'.video-lab-complete'
    digest=sha(path)
    if marker.exists() and marker.read_text()==digest: return
    def safe(name):
        p=(out/name).resolve()
        if not p.is_relative_to(out): raise ValueError('Unsafe archive path')
    if zipfile.is_zipfile(path):
        with zipfile.ZipFile(path) as z:
            infos=z.infolist()
            for i in infos:
                safe(i.filename)
                if stat.S_ISLNK(i.external_attr>>16): raise ValueError('Archive symlink rejected')
            expanded=sum(i.file_size for i in infos); budget(expanded)
            out.mkdir(parents=True,exist_ok=True); z.extractall(out)
    else:
        with tarfile.open(path) as z:
            infos=z.getmembers()
            for i in infos:
                safe(i.name)
                if not(i.isfile() or i.isdir()): raise ValueError('Archive links/devices rejected')
            expanded=sum(i.size for i in infos); budget(expanded)
            out.mkdir(parents=True,exist_ok=True); z.extractall(out, members=infos)
    marker.write_text(digest)

def fetch(manifest):
    report=[]
    for entry in manifest['assets']:
        print('Downloading',entry['id'],flush=True)
        path=download(entry); extract(entry,path)
        report.append({'id':entry['id'],'file':entry['file'],'bytes':path.stat().st_size,'sha256':sha(path),'status':'downloaded'})
        (CACHE/'last-fetch.json').write_text(json.dumps(report,indent=2))
    return report

def main():
    p=argparse.ArgumentParser(); p.add_argument('command',choices=['fetch','verify','inventory']); p.add_argument('--manifest',default=str(ROOT/'lab'/'sources.lock.json')); a=p.parse_args()
    if a.command=='inventory': print(json.dumps({'cache':str(CACHE),'used_bytes':budget(),'limit_bytes':LIMIT},indent=2));return
    m=json.loads(Path(a.manifest).read_text())
    if a.command=='fetch': fetch(m)
    else:
        for e in m['assets']:
            f=target(e['file'])
            if not f.exists() or not e.get('sha256') or sha(f)!=e['sha256']: raise RuntimeError('Missing or changed asset: '+e['id'])
            if e.get('extract_to') and not (target(e['extract_to'])/'.video-lab-complete').exists(): raise RuntimeError('Extraction incomplete: '+e['id'])
        print(f'Verified {len(m["assets"])} locked files')
if __name__=='__main__': main()
