"""Recreate shared Remotion runtime from its pinned branch lock without switching."""
import subprocess,os
from run import ROOT,RUNTIME,CACHE,A
A.budget(2_000_000_000);RUNTIME.mkdir(parents=True,exist_ok=True)
for name in ['package.json','package-lock.json']:
 data=subprocess.check_output(['git','show',f'lab/remotion:lab/example/{name}'],cwd=ROOT)
 (RUNTIME/name).write_bytes(data)
env=os.environ.copy();env['npm_config_cache']=str(CACHE/'npm-cache');env['TMPDIR']=str(CACHE/'tmp');env['PUPPETEER_SKIP_DOWNLOAD']='1'
subprocess.run(['npm','ci','--ignore-scripts','--no-audit','--no-fund'],cwd=RUNTIME,env=env,check=True)
A.budget()
