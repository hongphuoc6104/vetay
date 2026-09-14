"""First-run model staging; network downloads are confined to setup."""
import os
from pathlib import Path
root=Path(__file__).resolve().parents[2]
hub=root/'sys/models/hub';hub.mkdir(parents=True,exist_ok=True)
for name in ['models--pnnbao-ump--VieNeu-TTS-v3-Turbo','models--OpenMOSS-Team--MOSS-Audio-Tokenizer-Nano-ONNX']:
    target=hub/name;cached=Path.home()/'.cache/huggingface/hub'/name
    if not target.exists() and not target.is_symlink() and cached.exists():
        target.symlink_to(cached,target_is_directory=True)
os.environ['HF_HOME']=str(root/'sys/models')
os.environ.pop('HF_HUB_OFFLINE',None)
from vieneu import Vieneu
engine=Vieneu(mode='v3turbo',backend='onnx',device='cpu',precision='fp32')
engine.get_preset_voice('Adam')
print('Adam model and preset are ready for local inference.')
