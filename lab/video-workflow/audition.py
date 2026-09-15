"""Generate offline channel voice auditions, sequentially, under the shared lock."""
import json
import workflow as w
SAMPLES={
 'science':('Thử chạm vào một chiếc thìa kim loại. Lạnh, đúng không? Nhưng chiếc thìa gỗ bên cạnh cũng có cùng nhiệt độ! Vậy điều gì đang xảy ra? Kim loại lấy nhiệt từ tay bạn nhanh hơn.', [('Phạm Tuyên',1.0),('Mạnh Dũng',1.0),('Adam',1.0)]),
 'storytelling':('Mười hai phút. Vẫn chưa có lời hồi đáp. Tôi úp điện thoại xuống. Chắc cậu ấy lại quên rồi. Nhưng khi cửa mở... An đứng đó, ôm tập bản in tôi cần cho sáng mai. Tôi bỗng không biết nói gì.', [('Thanh Bình',1.0),('Đức Trí',1.0),('Thái Sơn',1.0)])}
def main():
 root=w.OUT/'voice-auditions-v2';root.mkdir(parents=True,exist_ok=True);reports=[]
 with w.lock():
  w.budget()
  for channel,(text,voices) in SAMPLES.items():
   for i,(preset,speed) in enumerate(voices):
    s={'voice':{'preset':preset,'speed':speed,'temperature':.7},'scenes':[{'text':text}]}
    a=w.speech(root,s)[0];target=root/f'{channel}-{i+1}.wav'
    w.shutil.copy2(a['path'],target)
    reports.append(dict(channel=channel,preset=preset,speed=speed,file=target.name,duration=a['duration'],auditory_review=False))
    print(channel,preset,a['duration'],flush=True)
 w.dump(root/'report.json',reports)
 (root/'index.html').write_text('<meta charset="utf-8"><title>Giọng hai kênh</title>'+''.join(f'<h2>{r["channel"]} — {r["preset"]} ({r["speed"]})</h2><audio controls src="{r["file"]}"></audio>' for r in reports))
if __name__=='__main__':main()
