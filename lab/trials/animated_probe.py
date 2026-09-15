"""Render upstream prepared character without detector, downloads or source patches."""
import sys,os,json,time,logging
from pathlib import Path
root=Path(sys.argv[1]).resolve();folder=Path(sys.argv[2]).resolve();folder.mkdir(parents=True,exist_ok=True);sys.path.insert(0,str(root));os.chdir(root)
logging.basicConfig(filename=str(folder/'render.log'),level=logging.INFO)
import glfw
original=glfw.create_window
def hidden(*args,**kwargs):glfw.window_hint(glfw.VISIBLE,glfw.FALSE);return original(*args,**kwargs)
glfw.create_window=hidden
# Hidden default window buffers can contain undefined pixels on NVIDIA.
# Allocate a dedicated color/depth framebuffer and redirect upstream framebuffer 0.
from animated_drawings.view.window_view import WindowView
from OpenGL import GL
create=WindowView._create_window
bind=GL.glBindFramebuffer
def offscreen(self,width,height):
    create(self,width,height)
    fbo=GL.glGenFramebuffers(1);bind(GL.GL_FRAMEBUFFER,fbo)
    tex=GL.glGenTextures(1);GL.glBindTexture(GL.GL_TEXTURE_2D,tex)
    GL.glTexImage2D(GL.GL_TEXTURE_2D,0,GL.GL_RGBA8,width,height,0,GL.GL_RGBA,GL.GL_UNSIGNED_BYTE,None)
    GL.glTexParameteri(GL.GL_TEXTURE_2D,GL.GL_TEXTURE_MIN_FILTER,GL.GL_LINEAR)
    GL.glTexParameteri(GL.GL_TEXTURE_2D,GL.GL_TEXTURE_MAG_FILTER,GL.GL_LINEAR)
    GL.glFramebufferTexture2D(GL.GL_FRAMEBUFFER,GL.GL_COLOR_ATTACHMENT0,GL.GL_TEXTURE_2D,tex,0)
    depth=GL.glGenRenderbuffers(1);GL.glBindRenderbuffer(GL.GL_RENDERBUFFER,depth)
    GL.glRenderbufferStorage(GL.GL_RENDERBUFFER,GL.GL_DEPTH_COMPONENT24,width,height)
    GL.glFramebufferRenderbuffer(GL.GL_FRAMEBUFFER,GL.GL_DEPTH_ATTACHMENT,GL.GL_RENDERBUFFER,depth)
    assert GL.glCheckFramebufferStatus(GL.GL_FRAMEBUFFER)==GL.GL_FRAMEBUFFER_COMPLETE
    GL.glDrawBuffer(GL.GL_COLOR_ATTACHMENT0);GL.glReadBuffer(GL.GL_COLOR_ATTACHMENT0)
    GL.glBindFramebuffer=lambda target,value:bind(target,fbo if value==0 else value)
WindowView._create_window=offscreen
# Keep BVH locomotion in place for portrait framing; joint rotations remain unchanged.
from animated_drawings.model.retargeter import Retargeter
frame_data=Retargeter.get_retargeted_frame_data
def in_place(self,t):
    angles,depths,position=frame_data(self,t)
    position=position.copy();position[0]=0
    return angles,depths,position
Retargeter.get_retargeted_frame_data=in_place
# Deterministic 8s export cap; the upstream BVH may be longer.
from animated_drawings.controller.video_render_controller import VideoRenderController
setup=VideoRenderController._set_frames_left_to_render_and_delta_t
def limit(self):setup(self);self.frames_left_to_render=min(self.frames_left_to_render,round(8/self.delta_t))
VideoRenderController._set_frames_left_to_render_and_delta_t=limit
import yaml
cfg=yaml.safe_load((root/'examples/config/mvc/export_mp4_example.yaml').read_text());cfg['view'].update(WINDOW_DIMENSIONS=[540,960],CAMERA_POS=[0,.7,5],CAMERA_FWD=[0,0,1],CLEAR_COLOR=[.96,.94,.87,1]);cfg['controller']['OUTPUT_VIDEO_PATH']=str(folder/'character.mp4');cfg['controller']['OUTPUT_VIDEO_CODEC']='mp4v'
p=folder/'config.yaml';p.write_text(yaml.safe_dump(cfg));start=time.monotonic()
from animated_drawings.render import start as render
render(str(p));(folder/'metrics.json').write_text(json.dumps({'elapsed_seconds':time.monotonic()-start,'status':'rendered','limitations':['prepared char1 only','zombie BVH reused with horizontal root motion removed','no detector or new image rigging tested']},indent=2))
