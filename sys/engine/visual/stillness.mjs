import {spawn} from 'node:child_process';
/** Compare to a stable anchor, not only adjacent frames: slow pen strokes accumulate. */
export async function contentHolds(file){
 const width=460,height=555,size=width*height;const p=spawn('ffmpeg',['-v','error','-i',file,'-vf',`crop=920:1110:80:550,fps=2,scale=${width}:${height}`,'-pix_fmt','gray','-f','rawvideo','pipe:1']);let buffer=Buffer.alloc(0),anchor,lastActivity=0,n=0,stderr='';const holds=[];
 p.stderr.on('data',d=>stderr+=d);const done=new Promise((yes,no)=>{p.on('error',no);p.on('close',c=>c?no(Error(stderr)):yes());});done.catch(()=>{});
 for await(const chunk of p.stdout){buffer=Buffer.concat([buffer,chunk]);while(buffer.length>=size){const frame=buffer.subarray(0,size);buffer=buffer.subarray(size);const time=n++/2;if(!anchor){anchor=Buffer.from(frame);continue;}let changed=0;for(let i=0;i<size;i++)if(Math.abs(frame[i]-anchor[i])>=12)changed++;if(changed/size>.0003){if(time-lastActivity>4)holds.push({start:lastActivity,end:time});lastActivity=time;anchor=Buffer.from(frame);}}}
 await done;if(buffer.length)throw Error('Truncated stillness analysis frame');if(n/2-lastActivity>4)holds.push({start:lastActivity,end:n/2});return holds;
}
