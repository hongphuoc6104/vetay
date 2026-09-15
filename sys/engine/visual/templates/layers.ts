import * as THREE from 'three';
/** Geometry carries the metaphor; screen-space labels remain readable. */
export class LayerStack{
 renderer:THREE.WebGLRenderer;scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(34,1080/1920,.1,100);group=new THREE.Group();meshes:THREE.Mesh[]=[];
 constructor(colors:string[]){this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});this.renderer.setSize(1080,1920);this.renderer.setClearColor(0,0);this.camera.position.z=7;
 this.scene.add(new THREE.AmbientLight(0xffffff,1.2));const key=new THREE.DirectionalLight(0xffffff,1.8);key.position.set(-3,5,6);this.scene.add(key);
 colors.forEach((color,i)=>{const canvas=document.createElement('canvas');canvas.width=800;canvas.height=400;const c=canvas.getContext('2d')!;c.fillStyle=color;c.fillRect(0,0,800,400);c.strokeStyle='#12343C';c.fillStyle='#12343C';c.lineWidth=8;c.lineCap='round';
 if(i===0){for(let n=0;n<3;n++){c.beginPath();c.moveTo(90,110+n*85);c.lineTo(n===2?440:680,110+n*85);c.stroke();}}
 if(i===1){for(let n=0;n<3;n++){c.strokeRect(90+n*240,150,120,100);if(n<2){c.beginPath();c.moveTo(220+n*240,200);c.lineTo(310+n*240,200);c.stroke();}}}
 if(i===2){c.beginPath();c.ellipse(400,200,205,100,0,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(170,320);c.quadraticCurveTo(400,345,640,320);c.stroke();}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const materials=Array.from({length:6},(_,face)=>new THREE.MeshStandardMaterial({color:face===4?'#ffffff':color,map:face===4?texture:null,roughness:.65,metalness:.05}));const mesh=new THREE.Mesh(new THREE.BoxGeometry(2.3,1.15,.075),materials);this.group.add(mesh);this.meshes.push(mesh);});this.scene.add(this.group);}
 draw(ctx:CanvasRenderingContext2D,spread:number,turn:number){this.group.rotation.set(.30,-.32+turn,.045);this.group.scale.setScalar(.56);this.group.position.y=.20;this.meshes.forEach((m,i)=>m.position.set((i-1)*.14*spread,(1-i)*.8*spread,(i-1)*.28));this.renderer.render(this.scene,this.camera);ctx.drawImage(this.renderer.domElement,0,0);}
}
