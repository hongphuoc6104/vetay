# Visual proof — two original 22-second scenes

Two bespoke Motion Canvas compositions: `mirror` (fiction) and `pump` (simplified scientific diagram). Original vector artwork and synthesized sound effects; no stock characters, paid APIs, music downloads, or new model weights. Motion Canvas 3.17.2 uses the existing locked runtime. Local Adam narration uses the existing Vieneu environment.

From the repository root:

```sh
python3 lab/visual-proof/prepare.py
python3 lab/visual-proof/render.py mirror 0.5
python3 lab/visual-proof/render.py pump 0.5
python3 lab/visual-proof/render.py mirror 1
python3 lab/visual-proof/render.py pump 1
```

Run sequentially. Output: shared `video-lab-cache/trials/visual-proof/`. Each full output is native 1080×1920, 30fps, 22 seconds with AAC audio; SRT captions and narration WAV are alongside it. The runtime requires Node, system Chrome, the existing Playwright installation, FFmpeg, and the existing offline voice environment in sibling `vetay`.

The pump is an explicit two-check-valve schematic, not an exact cross-section of every bicycle pump. Intake and discharge are gated to their respective phases; particles are illustrative, not a fluid simulation. Pressure is qualitative. Reference: https://files.eric.ed.gov/fulltext/ED134698.pdf (pneumatics, piston and cup seal operating principles). No recommended tire pressures or operating safety claims are made.

The mirror has separately articulated actors and a delayed reflection; camera and gesture timing are authored for this single story. This is not a universal story generator. Walking and turning remain stylized limited animation.

Narration cues use actual local speech durations. The effects are generated locally with sine impulses and quiet tonal ambience. Subtitles occupy a reserved lower region; sentence-level SRT is provided.

Review status and render measurements are recorded in the local delivery report. Frame inspection and decode checks do not imply auditory or full-speed playback review.
