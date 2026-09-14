/** Neutral integration fixture, no demo content or external assets. */
export function neutralProject(duration=3){return {
 id:'neutral',title:'Ví dụ bộ dựng',stylePreset:'net-cinematic-v1',rendererVersion:'1.0.0',palette:'technology',theme:'auto',format:{width:1080,height:1920,fps:30},approved:true,audioMaster:'master.wav',scenes:[{
 id:'example',start:0,end:duration,role:'body',theme:'auto',label:'VÍ DỤ / NÉT',title:['Làm rõ một ý.','Rồi đi tiếp.'],elements:[
 {id:'paper',type:'panel',x:98,y:594,width:884,height:850,fill:'panel',children:[{id:'list',type:'list',x:65,y:130,width:754,fontSize:44,items:[{text:'Một hành động rõ ràng',cue:.2},{text:'Một kết quả cụ thể',cue:1.2}]}]},
 {id:'underline',type:'stroke',x:265,y:810,points:[[0,0],[200,5],[500,0]],color:'teal',animate:{progress:[{at:.7,value:0},{at:1.4,value:1}]}},
 {id:'circle',type:'ellipse',x:205,y:975,rx:43,ry:42,color:'gold',animate:{progress:[{at:1.5,value:0},{at:2.4,value:1}]}}
 ]}
 ]};}
