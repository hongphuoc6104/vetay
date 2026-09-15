# Nét cinematic v1 — author content, reuse the renderer

## Required workflow

Use `stylePreset: net-cinematic-v1`, `rendererVersion: 1.0.0`, technology palette by default and 1080×1920/30fps. The shared renderer is `sys/engine/visual/render.mjs`. Do not replace it with HTML-state screenshots concatenated into a slideshow. An installed animation dependency or 30fps output is not evidence of motion.

Author `project.json`, `speech.json`, narration WAVs and assets under `sys/work/<slug>/`. `studio.mjs preview/render/resume` validates speech timing, assembles narration and calls the shared renderer. Set `audioMaster` to `master.wav`. To preserve a deliberately mixed music/foley master, render it with the low-level shared renderer after validating timing; the studio path assembles a narration-only master.

For new videos, add the `publication` block described in [publication.md](publication.md). It owns the frame-0 keyword intro, the deterministic `coverFrame` and the final light/dark avatar; scene content owns the explanation and takeaway text.

The renderer loads Be Vietnam Pro before drawing, uses the brand file as the color source, renders every frame and caches scene-local frames. Theme `auto` resolves `hook`, `chapter`, `recap` to dark; other roles to light. Do not leave a whole explanatory film dark by ignoring its theme metadata.

## Scene contract

Each scene has `id`, `role`, optional `theme`, `label`, `title` (one or two deliberately broken lines), `start`, `end`, `elements`. Scenes cover the timeline without gaps. Cue times can be seconds or `{phrase: "p3", edge: "speechStart", offset: 0.2}`. Supported edges: start, end, speechStart, speechEnd. Use measured word anchors separately when word-level timing is needed; never divide a sentence into equal word times.

Use `sys/engine/examples/neutral.mjs` as a minimal content example. This example is a renderer integration fixture, not a style reference film or a replacement for original scene design.

### Components

- `text`: text, x/y, width, optional height, fontSize, weight, color, align. Explicit newlines preserve phrasing; wrapping never shrinks text. Main text minimum 40px; `secondary:true` permits 28px. Oversized text throws an error instead of clipping. Titles are 68px. Metadata in the branded header is intentionally smaller and is not instructional text.
- `panel`: x/y, width/height, radius, fill, border, children. Default paper panel is 884px wide, x=98, y=594. Use panels as an evolving workspace, not a grid of tiny cards.
- `group`: children sharing a transform.
- `image` / `video`: src relative to the project, width/height, optional crop `[sx,sy,sw,sh]`, radius. Video is muted in the visual layer; its audio belongs in the final mix. `sourceStart` and `enter` determine the source clock. Missing assets fail before render.
- `stroke`: points, progress 0..1, color, lineWidth, optional pen. `ellipse`: x/y, rx/ry, progress. Animate progress to draw a line instead of displaying a prepainted annotation.
- `list`: aligned number and text columns, width, fontSize, gap and items. Items may have text and cue. Continuation lines align with text.
- `projection`: stable id, width/height of its internal surface, children, rx/ry/rz, px/py, zoom, layers. This component uses the approved Three.js perspective paper rig. It renders in full-frame coordinates; use its pose properties, not group transforms, to position it. Keep readable text still when users must inspect it.

All components support `enter`, `exit`, `opacity`, x/y, scale and rotate; animate numeric properties through `animate: {property: [{at: cue, value: number}, ...]}`. Keyframes increase strictly. `reveal` with width/height clips a progressive reveal. Scene `camera` may animate zoom, x and y; preserve the same object data between related scenes to create a continuous transformation. Automatic chapter ribbons connect scenes; do not add a hard cut over them.

Use named brand tokens: navy, aqua, teal, gold, paper, panel, ink, muted, captionLight, captionDark, border; foreground resolves from theme. Raw custom hex colors in authored components fail validation. Both palettes and both themes use the same component implementation.

## Production verification

1. Preview a short real passage first. Check typography at phone size, source-to-answer continuity, pen progress and camera depth, including multiple frames from transitions.
2. Inspect all four theme/palette combinations when changing shared components. Preserve the approved demo's geometry and stroke behavior when refactoring; keep comparison artifacts local.
3. The final render analyzes x=80..1000, y=550..1660 for holds, excluding captions and progress. Holds >4s are reported; >8s require a meaningful scene `holdReason`. Inspect reported intervals; moving a cursor or decorative object is not proof the instruction is engaging.
4. Verify full playback and audio, exact duration, captions and pause policy. Do not deliver based only on successful encoding or a contact sheet.
5. Render a second time to check cache reuse. Changing an asset, font, palette, timing or shared renderer must invalidate the affected cache. Current version invalidates all frames within an affected scene; it does not promise object-level caching.

Keep generated media, real video project code, experimental takes and architecture diagrams outside Git. Commit reusable components, neutral examples, tests and skill references only.
