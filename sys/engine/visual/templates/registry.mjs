export const TEMPLATE_VERSION='1.0.0';
export const catalog=[
 ['focus','Mở đầu / một ý','Một thông điệp và một điểm nhấn',1],
 ['freehand','Vùng vẽ tự do','Đường SVG giải thích, nhãn ở vùng riêng',3],
 ['cards','Thẻ mở rộng','Tối đa ba phần thông tin theo câu đọc',3],
 ['layers','Các lớp chiều sâu','Ba lớp 3D tách ra rồi ghép lại',3],
 ['editor','Thao tác thật','Ảnh/video thao tác và vùng chữ bảo vệ',3],
 ['compare','Trước và sau','Hai trạng thái, bố cục trên–dưới',2],
 ['steps','Đường đi từng bước','Ba hành động có thứ tự',3],
 ['recap','Kết luận','Ba điều cần nhớ',3]
].map(([id,name,purpose,maxItems])=>({id,name,purpose,maxItems,version:TEMPLATE_VERSION,status:'candidate'}));
export function validateTemplate(spec){
 const ids=new Set();for(const item of spec.items||[]){if(!item.id||ids.has(item.id))throw Error('Template item IDs must be unique');ids.add(item.id);}
 for(const a of spec.annotations||[]){if(!['underline','circle','arrow','strike'].includes(a.kind))throw Error('Unknown annotation kind');if(a.color&&!['teal','gold','aqua','ink','paper'].includes(a.color))throw Error('Use brand annotation color');}
 const entry=catalog.find(t=>t.id===spec.id);if(!entry||spec.version!==TEMPLATE_VERSION)throw Error('Unknown template/version');
 if(spec.items?.length>entry.maxItems)throw Error('Split content: too many template items');
 for(const item of spec.items||[]){if(typeof item.text!=='string'||item.text.length>110)throw Error('Split long template text');if(item.label?.length>30)throw Error('Template label too long');}
 for(const drawing of spec.drawings||[]){if(typeof drawing.path!=='string'||drawing.path.length>12000||!/^[MmLlHhVvCcSsQqTtAaZz\d\s.,+eE-]+$/.test(drawing.path))throw Error('Only SVG path geometry is allowed');if(/m/.test(drawing.path))throw Error('Use absolute M for each lifted subpath');if(drawing.fill&&!['teal','gold','aqua','ink','paper'].includes(drawing.fill))throw Error('Use brand fill color');if(drawing.color&&!['teal','gold','aqua','ink','paper'].includes(drawing.color))throw Error('Use a brand drawing color');if(!Array.isArray(drawing.box)||drawing.box.length!==4)throw Error('Drawing requires [x,y,width,height]');}
 if(spec.id==='editor'&&!spec.src)throw Error('Editor template requires real captured media');
 if(spec.annotations?.some(a=>a.kind==='strike'&&!spec.items?.some(i=>i.id===a.targetId&&i.incorrect)))throw Error('Strike requires explicitly incorrect target');
 return entry;
}
export function compileTemplates(project){
 if(!project.scenes?.some(s=>s.template))return project;
 return {...project,scenes:project.scenes.map(s=>{
  if(!s.template)return s;
  const drawings=(s.template.drawings||[]).map(d=>{
   if(!d.ref)return d;
   if(Object.keys(d).some(k=>k!=='ref'))throw Error('Drawing refs cannot override shared state');
   if(!Object.hasOwn(project.drawingLibrary||{},d.ref))throw Error('Unknown drawing ref: '+d.ref);
   return {...project.drawingLibrary[d.ref],id:d.ref};
  });
  const spec={...s.template,drawings};validateTemplate(spec);
  if(s.camera)throw Error('Template camera is managed by the preset');
  if(s.elements?.length)throw Error('Template scenes cannot override raw layout elements');
  return {...s,template:spec,elements:[{id:s.id+'-template',type:'template',spec,src:spec.src,mediaType:spec.mediaType,sceneStart:s.start,sceneEnd:s.end}]};
 })};
}
