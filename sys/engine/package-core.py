"""Create a portable source-only Nét studio package, including uncommitted reusable files."""
from pathlib import Path
import tarfile,argparse,hashlib,json
root=Path(__file__).resolve().parents[2]
ap=argparse.ArgumentParser();ap.add_argument('--output',type=Path,required=True);args=ap.parse_args();args.output.parent.mkdir(parents=True,exist_ok=True)
files=[]
for name in ['AGENTS.md','CLAUDE.md','GEMINI.md','README.md','.gitignore']:
 p=root/name
 if p.exists():files.append(p)
for directory in ['sys/skill','sys/templates','sys/engine']:
 for p in (root/directory).rglob('*'):
  if p.is_file() and not any(x in ['node_modules','__pycache__','.venv','cache','work','logs','models','video'] for x in p.relative_to(root).parts) and (p.suffix.lower() not in ['.pyc','.wav','.mp3','.mp4','.webm','.log'] or root/'sys/templates/brand/media' in p.parents):files.append(p)
manifest={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
with tarfile.open(args.output,'w:gz') as tf:
 for p in files:tf.add(p,arcname='net-studio/'+str(p.relative_to(root)))
 for name in ['.agents','.agents/skills']:
  info=tarfile.TarInfo('net-studio/'+name);info.type=tarfile.DIRTYPE;info.mode=0o755;tf.addfile(info)
 info=tarfile.TarInfo('net-studio/.agents/skills/cinematic-tutorial-video');info.type=tarfile.SYMTYPE;info.linkname='../../sys/skill/cinematic-tutorial-video';tf.addfile(info)
args.output.with_suffix('.manifest.json').write_text(json.dumps(manifest,indent=2))
print(args.output,len(files),'files')
