#!/usr/bin/env python3
"""Prepare isolated Node runtime using a committed lockfile; never install globally."""
import json,os,shutil,subprocess,sys
from pathlib import Path
import assets as A
name=json.loads((A.ROOT/'lab/experiment.json').read_text())['name']
runtime=A.CACHE/'runtimes'/name;runtime.mkdir(parents=True,exist_ok=True)
example=A.ROOT/'lab/example'
for src in example.rglob('*'):
 if src.is_file():
  dst=runtime/src.relative_to(example);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
mode=sys.argv[1] if len(sys.argv)>1 else 'test'
env=os.environ.copy();env['npm_config_cache']=str(A.CACHE/'npm-cache');env['PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD']='1';env['PUPPETEER_SKIP_DOWNLOAD']='1'
(A.CACHE/'tmp').mkdir(exist_ok=True)
env['TMPDIR']=str(A.CACHE/'tmp')
if mode=='install':
 A.budget(2_000_000_000)
 subprocess.run(['npm','ci','--ignore-scripts','--no-audit','--no-fund'],cwd=runtime,env=env,check=True)
 A.budget()
elif mode=='test':
 subprocess.run(['npm','run','test'],cwd=runtime,env=env,check=True)
else:raise SystemExit('Use install or test')
print(runtime)
