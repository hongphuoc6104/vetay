"""Explicit opt-in install of locked Motion Canvas runtime; no model downloads."""
import os,shutil,subprocess
from workflow import HERE,RUNTIME,CACHE,budget,lock
with lock():
 budget(2_000_000_000);RUNTIME.mkdir(parents=True,exist_ok=True)
 for name in ['package.json','package-lock.json']:shutil.copy2(HERE/'runtime'/name,RUNTIME/name)
 env=os.environ.copy();env.update(npm_config_cache=str(CACHE/'npm-cache'),PUPPETEER_SKIP_DOWNLOAD='1')
 subprocess.run(['npm','ci','--ignore-scripts','--no-audit','--no-fund'],cwd=RUNTIME,env=env,check=True)
 budget(0)
