"""Sequential render queue: never run multiple heavy renders concurrently."""
import subprocess,sys
from pathlib import Path
run=Path(__file__).with_name('run.py')
for id in sys.argv[1:]:subprocess.run([sys.executable,str(run),'render',id,'--scale','0.5'],check=True)
