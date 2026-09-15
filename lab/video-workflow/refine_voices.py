"""Refinement audition after user feedback. No pitch shifting or speed reduction."""
import workflow as w
SAMPLES=[
 ('science-refined','Phạm Tuyên','Thử chạm vào một chiếc thìa kim loại. Lạnh, đúng không?\n\nNhưng đây mới là điều thú vị: chiếc thìa gỗ bên cạnh có thể cùng nhiệt độ với nó!\n\nVậy tại sao cảm giác lại khác? Vì kim loại lấy nhiệt từ tay bạn nhanh hơn.'),
 ('story-duc-tri','Đức Trí','Chiều hôm ấy, Mai cứ nhìn mãi vào màn hình điện thoại. An vẫn chưa trả lời.\n\nCô khẽ đặt máy xuống, nghĩ rằng bạn đã quên.\n\nRồi cửa mở. An đứng đó, áo còn ướt mưa, nhưng tập giấy trong tay vẫn khô nguyên.'),
 ('story-thai-son','Thái Sơn','Chiều hôm ấy, Mai cứ nhìn mãi vào màn hình điện thoại. An vẫn chưa trả lời.\n\nCô khẽ đặt máy xuống, nghĩ rằng bạn đã quên.\n\nRồi cửa mở. An đứng đó, áo còn ướt mưa, nhưng tập giấy trong tay vẫn khô nguyên.')]
def main():
 root=w.OUT/'voice-refinement';root.mkdir(parents=True,exist_ok=True);rows=[]
 with w.lock():
  w.budget()
  for name,preset,text in SAMPLES:
   spec={'voice':{'preset':preset,'speed':1.0,'temperature':.7,'version':3},'scenes':[{'text':text}]}
   a=w.speech(root,spec)[0];w.shutil.copy2(a['path'],root/(name+'.wav'))
   rows.append(dict(name=name,preset=preset,duration=a['duration'],auditory_review=False));print(name,a['duration'],flush=True)
 w.dump(root/'report.json',rows)
 (root/'index.html').write_text('<meta charset="utf-8"><title>Mẫu giọng tinh chỉnh</title>'+''.join(f'<h2>{r["name"]} — {r["preset"]}</h2><audio controls src="{r["name"]}.wav"></audio>' for r in rows))
if __name__=='__main__':main()
