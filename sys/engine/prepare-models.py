"""First-run model staging; network downloads are confined to setup."""
import os,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
hub=root/'sys/models/hub';hub.mkdir(parents=True,exist_ok=True)
os.environ['HF_HOME']=str(root/'sys/models')
if '--check' in sys.argv: os.environ['HF_HUB_OFFLINE']='1'
else: os.environ.pop('HF_HUB_OFFLINE',None)
from vieneu import Vieneu
engine=Vieneu(mode='v3turbo',backend='onnx',device='cpu',precision='fp32')
engine.get_preset_voice('Adam')
print('Adam model and preset are ready for local inference.')
