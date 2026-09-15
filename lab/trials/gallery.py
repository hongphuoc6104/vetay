#!/usr/bin/env python3
"""Build an offline viewing page. No media copies and no network requests."""
import argparse,html,json,subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
DEFAULT=HERE.parents[2]/'video-lab-cache'/'trials'
GROUPS={'exploration':'Khám phá','validation':'Thử thêm tập','long':'Truyện dài','technical':'So sánh công cụ'}
BRANCHES={'vector':'vector-story','sketch':'sketch-story','kenney':'kenney-story','quickdraw':'quickdraw','remotion':'remotion','motion':'motion-canvas','external':'generative-ai','animated':'animated-drawings'}
def read(path):
 try:return json.loads(path.read_text())
 except (OSError,ValueError):return {}
def esc(s):return html.escape(str(s),quote=True)
def valid_video(path):
 if not path.is_file() or path.stat().st_size==0:return None
 p=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration:stream=width,height,codec_type','-of','json',str(path)],capture_output=True,text=True)
 if p.returncode:return None
 try:return json.loads(p.stdout)
 except ValueError:return None
def build(root):
 root.mkdir(parents=True,exist_ok=True)
 specs={p.stem:read(p) for p in sorted((HERE/'episodes').glob('*.json'))}
 for name in ['vector-02','vector-03','vector-04','vector-long','quickdraw-02','quickdraw-03','quickdraw-04']:specs.setdefault(name,{})
 specials={'motion-benchmark':('Đoạn chuẩn · Motion Canvas','motion','preview.mp4'), 'motion-reveal':('Nét vẽ xuất hiện dần · Motion Canvas','motion','preview.mp4'), 'animated-drawings':('Nhân vật vẽ tay chuyển động','animated','character.mp4'),'animated-comedy':('Tình huống hài từ nhân vật vẽ tay','animated','comedy.mp4')}
 order=['benchmark','vector-01','sketch-01','kenney-01','quickdraw-01','motion-benchmark','motion-reveal','animated-drawings','animated-comedy','external-import','vector-02','vector-03','vector-04','quickdraw-02','quickdraw-03','quickdraw-04','vector-long']
 order+=sorted((set(specs)|set(specials))-set(order));cards=[];ready=0
 for name in order:
  spec=specs.get(name,{})
  group='long' if name.endswith('-long') else 'validation' if name.endswith(('-02','-03','-04')) else 'technical' if name in specials or name in ['benchmark','external-import'] else 'exploration'
  title=spec.get('title',name);style=spec.get('style',name.split('-')[0]);folder=root/('animated-drawings' if name=='animated-comedy' else name)
  paths=[folder/'final.mp4',folder/'preview.mp4']
  if name in specials:title,style,filename=specials[name];paths=[folder/'final.mp4',folder/filename]
  if name=='benchmark':title='Đoạn chuẩn · Remotion';style='remotion'
  if name=='external-import':style='external'
  selected=None;probe={}
  for path in paths:
   data=valid_video(path)
   if data:selected=path;probe=data;break
  branch=BRANCHES.get(style,'base');links=[];facts=[]
  if selected:
   ready+=1;relative=selected.relative_to(root).as_posix();kind='final' if selected.name=='final.mp4' else 'preview'
   label='Bản xuất đầy đủ' if kind=='final' else 'Bản xem thử'
   video=next((x for x in probe.get('streams',[]) if x.get('codec_type')=='video'),{})
   duration=float(probe.get('format',{}).get('duration',0));facts=[f'{duration:.1f} giây',f"{video.get('width','?')} × {video.get('height','?')}",f'{selected.stat().st_size/1e6:.1f} MB']
   poster=next((p for p in [folder/'character-frame.png',folder/'qa'/(kind+'-contact.jpg'),folder/'qa'/'preview-contact.jpg'] if p.exists()),None)
   poster_attr=f' poster="{esc(poster.relative_to(root).as_posix())}"' if poster else ''
   media=f'<video{poster_attr} controls preload="none" playsinline src="{esc(relative)}" aria-label="{esc(title)}"></video>'
   links.append(f'<a href="{esc(relative)}" download>Tải video</a>')
   metrics=folder/(kind+'-metrics.json')
   if name in specials:metrics=folder/('comedy-metrics.json' if name=='animated-comedy' else 'metrics.json')
   if metrics.exists():
    m=read(metrics);elapsed=m.get('elapsed_seconds')
    if isinstance(elapsed,(float,int)):facts.append(f'Dựng {elapsed/60:.1f} phút')
    links.append(f'<a href="{esc(metrics.relative_to(root).as_posix())}">Số liệu thực tế</a>')
   qa=folder/('qa-'+kind+'.json')
   if qa.exists():links.append(f'<a href="{esc(qa.relative_to(root).as_posix())}">Kết quả kiểm tra</a>')
  else:
   label='Chưa có video xem được';media='<div class="waiting"><span>◌</span><p>Đang chuẩn bị hoặc chưa xuất xong</p></div>'
  if (folder/'subtitles.srt').exists():links.append(f'<a href="{esc((folder/"subtitles.srt").relative_to(root).as_posix())}">Phụ đề</a>')
  links.append(f'<a href="https://github.com/hongphuoc6104/vetay/tree/lab/{branch}">Nhánh nguồn</a>')
  note=''
  if name.startswith('animated'):note='Thử nhân vật mẫu có sẵn; chưa kiểm chứng tự xử lý mọi hình mới.'
  if name=='external-import':note='Thử nhập hình có sẵn; chưa chạy mô hình tạo hình AI.'
  cards.append(f'<article data-group="{group}"><div class="media">{media}</div><div class="body"><div class="eyebrow">{GROUPS[group]} · {esc(spec.get("series",style))}</div><h2>{esc(title)}</h2><p class="status {"ready" if selected else "pending"}">{label}</p><p class="facts">{esc(" · ".join(facts))}</p><p class="note">{esc(note)}</p><div class="links">{"".join(links)}</div></div></article>')
 page='''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Phòng thử video kể chuyện</title><style>
*{box-sizing:border-box}body{margin:0;background:#0d1725;color:#edf4fa;font:16px/1.55 system-ui,sans-serif}header,main{max-width:1240px;margin:auto;padding:28px}header{padding-top:52px}h1{font-size:clamp(28px,5vw,48px);line-height:1.15;margin:12px 0}header p{max-width:850px;color:#b4c6d8}.tag{color:#75e1c1;text-transform:uppercase;letter-spacing:2px;font-size:13px}.filters{display:flex;gap:10px;flex-wrap:wrap;margin-top:26px}button{border:1px solid #486179;border-radius:24px;background:#18293b;color:#e7f0f7;padding:10px 18px;font:inherit;cursor:pointer}button[aria-pressed=true]{background:#75e1c1;color:#102331;border-color:#75e1c1}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:24px}article{background:#172638;border:1px solid #2e4156;border-radius:18px;overflow:hidden}article[hidden]{display:none}.media{height:365px;background:#080e17;display:flex;align-items:center;justify-content:center}video{height:100%;width:100%;object-fit:contain}.body{padding:22px}h2{font-size:21px;line-height:1.3;margin:9px 0 14px}.eyebrow{font-size:12px;color:#9bb3c9}.status{font-size:13px;font-weight:700}.ready{color:#86e6c9}.pending{color:#f6cf89}.facts,.note{font-size:13px;color:#b7c8d8}.note:empty{display:none}.links{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}.links a{color:#9ccfff;font-size:13px;text-underline-offset:4px}.waiting{text-align:center;padding:20px;color:#91a6bb}.waiting span{font-size:48px}footer{max-width:1240px;margin:20px auto 50px;padding:0 28px;color:#91a6bb;font-size:13px}</style><header><div class="tag">Video Lab · Thử từng hướng</div><h1>Chọn cách kể chuyện của bạn</h1><p>__COUNT__ video hiện xem được. Mở từng mẫu để so sánh cách kể, nét vẽ và chuyển động. Ưu tiên bản xuất đầy đủ khi có; các bản xem thử được ghi rõ bên dưới.</p><p>Các mẫu dùng để đánh giá khả năng sản xuất. Chất lượng giọng đọc và sức hút với người xem vẫn cần đánh giá riêng.</p><nav class="filters" aria-label="Lọc video"><button data-filter="all" aria-pressed="true">Tất cả</button>__FILTERS__</nav></header><main><div class="grid">__CARDS__</div></main><footer>Trang dùng các video tại máy này, không tự tải hay đăng video lên mạng. Liên kết “Nhánh nguồn” mở GitHub. Tạo lại trang sau mỗi đợt xuất để cập nhật trạng thái.</footer><script>document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('[data-group]').forEach(c=>c.hidden=b.dataset.filter!=='all'&&c.dataset.group!==b.dataset.filter)}));</script></html>'''
 page=page.replace('__COUNT__',str(ready)).replace('__FILTERS__',''.join(f'<button data-filter="{k}" aria-pressed="false">{v}</button>' for k,v in GROUPS.items())).replace('__CARDS__',''.join(cards))
 target=root/'index.html';target.write_text(page);print(target);print(f'{ready}/{len(cards)} videos available')
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--root',type=Path,default=DEFAULT);build(p.parse_args().root)
