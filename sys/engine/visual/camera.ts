import * as THREE from 'three';
/** Same perspective rig as the approved demo; media and pose are caller data. */
export class PaperCamera{
 renderer:THREE.WebGLRenderer;scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1080/1920,.1,100);group=new THREE.Group();mesh:THREE.Mesh;backs:THREE.Mesh[]=[];texture:THREE.CanvasTexture;geometry:THREE.PlaneGeometry;
 constructor(public source:HTMLCanvasElement,teal:string){
  this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});this.renderer.setSize(1080,1920);this.renderer.setPixelRatio(1);this.renderer.setClearColor(0,0);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.camera.position.z=5.3;
  this.geometry=new THREE.PlaneGeometry(1.69,1.69*source.height/source.width);this.texture=new THREE.CanvasTexture(source);this.texture.colorSpace=THREE.SRGBColorSpace;
  this.mesh=new THREE.Mesh(this.geometry,new THREE.MeshBasicMaterial({map:this.texture,transparent:true,side:THREE.DoubleSide}));this.group.add(this.mesh);
  for(let i=0;i<3;i++){const m=new THREE.Mesh(this.geometry,new THREE.MeshBasicMaterial({color:i%2?teal:'#cad7c7',transparent:true,opacity:.27,side:THREE.DoubleSide}));m.position.set(.055*(i+1),-.04*(i+1),-.045*(i+1));this.group.add(m);this.backs.push(m);}
  this.scene.add(this.group);
 }
 draw(ctx:CanvasRenderingContext2D,pose:any={}){this.texture.needsUpdate=true;this.group.rotation.set(pose.rx||0,pose.ry||0,pose.rz||0);this.group.position.set(pose.x||0,pose.y??-.18,0);this.group.scale.setScalar(pose.scale??1);this.backs.forEach(b=>b.visible=pose.layers!==false);this.renderer.render(this.scene,this.camera);ctx.drawImage(this.renderer.domElement,0,0);}
 dispose(){this.geometry.dispose();this.texture.dispose();for(const m of [this.mesh,...this.backs])(m.material as THREE.Material).dispose();this.renderer.dispose();}
}
