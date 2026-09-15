"""Reuse the prepared-character motion as a 20s silent-caption comedy demo."""
import json,subprocess,time,sys
from pathlib import Path
folder=Path(sys.argv[1]).resolve()
ass='''[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
Style: Caption,DejaVu Sans,55,&H00373325,&H000000FF,&H00FFFFFF,&H60000000,-1,0,0,0,100,100,0,0,1,2,0,8,75,75,165,1
Style: Foot,DejaVu Sans,30,&H00373325,&H000000FF,&H00FFFFFF,&H60000000,0,0,0,0,100,100,0,0,1,1,0,2,60,60,170,1
[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
Dialogue: 0,0:00:00.00,0:00:05.00,Caption,,0,0,0,,TÔI SAU KHI HỨA:\\N“Mai sẽ dậy lúc 5 giờ!”
Dialogue: 0,0:00:05.00,0:00:10.00,Caption,,0,0,0,,05:00 — Báo thức reo.\\NTâm hồn đã thức dậy…
Dialogue: 0,0:00:10.00,0:00:15.00,Caption,,0,0,0,,…cơ thể đang tải bản cập nhật.\\NXin đừng tắt nguồn.
Dialogue: 0,0:00:15.00,0:00:20.00,Caption,,0,0,0,,05:03 — Cập nhật thất bại.\\NHẹn gặp bạn lúc 08:30!
Dialogue: 0,0:00:00.00,0:00:20.00,Foot,,0,0,0,,Thử nghiệm hình vẽ chuyển động\\NChar1 + zombie BVH • Meta Animated Drawings
'''
(folder/'comedy.ass').write_text(ass)
start=time.monotonic()
cmd=['ffmpeg','-y','-hide_banner','-loglevel','warning','-threads','2','-stream_loop','-1','-i',str(folder/'character.mp4'),'-t','20','-vf',f"scale=1080:1920,setsar=1,subtitles={folder/'comedy.ass'}",'-r','30','-c:v','libx264','-threads','2','-filter_threads','2','-preset','fast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart','-an',str(folder/'comedy.mp4')]
subprocess.run(cmd,check=True)
(folder/'comedy-metrics.json').write_text(json.dumps({'elapsed_seconds':time.monotonic()-start,'status':'rendered','duration_seconds':20,'audio':False,'limitations':['motion loop repeated; no semantic acting','prepared character only']},indent=2))
