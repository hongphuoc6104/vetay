"""Serial full resolution queue, continue after per-episode failure and report all."""
import sys,subprocess,time,json
from pathlib import Path
from run import OUT,HERE,dump
ids=sys.argv[1:] or ['vector-01','sketch-01','kenney-01','quickdraw-01','vector-02','vector-03','vector-04','quickdraw-02','quickdraw-03','quickdraw-04','vector-long','external-import']
rows=[]
for id in ids:
 start=time.monotonic();r=subprocess.run([sys.executable,str(HERE/'run.py'),'render',id]);rows.append({'id':id,'exit_code':r.returncode,'wall_seconds':time.monotonic()-start});dump(OUT/'final-queue.json',rows)
 if r.returncode==0:subprocess.run([sys.executable,str(HERE/'qa.py'),id,'--kind','final'])
 subprocess.run([sys.executable,str(HERE/'gallery.py')])
if any(r['exit_code'] for r in rows):raise SystemExit(1)
