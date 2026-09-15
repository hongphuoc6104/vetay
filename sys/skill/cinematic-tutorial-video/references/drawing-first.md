# Drawing-first production

This is the canonical workflow for the ve-tay-thuan branch.

## Story before narration

Write 18–24 visual beats per approximately three-minute episode. Record the initial object, drawing action, resulting state, supporting narration, visible labels and carried objects. Give each episode one question, one concrete situation and one usable outcome. Research factual claims and keep metaphors distinct from evidence. Label invented examples “Minh họa”.

Start with a visual tension. Use persistent objects and meaningful changes rather than repeated title panels. Keep labels to 1–4 whitespace-separated words, at most two simultaneously. Sidecar subtitles retain the full spoken text. The final frame may express the takeaway with a short label; richer explanation stays in narration or the description.

Produce two Adam candidates for each changed semantic phrase. Measure the selected final-speed WAVs. Treat beat timestamps as editorial budgets until audio is measured. Do not slow the narrator or stretch a static frame to hit a duration. Prefer drawing during narration. A short silent observation may use the existing visual pause of 2–4 seconds. For guided samples aim for 75–85% voiced time, measured from speech windows; do not force this editorial target by changing voice speed.

## Project interface

- `layout: "drawing-first"` selects a clean paper canvas with workspace x=80..1000, y=220..1610. Headers, chapter ribbons, permanent titles and the progress bar are absent. The template must be `freehand`; no scene camera override.
- `captionMode: "sidecar"` removes burned-in captions and still exports SRT. Set both explicitly in production manifests.
- `drawingLibrary` maps stable object IDs to full drawing definitions. `template.drawings` accepts `{ "ref": "bridge" }` or existing inline drawings. A ref cannot override its definition. Use the same ref in consecutive scenes to preserve geometry, draw progress and absolute-time movement when seeking or resuming.
- Drawing definitions retain `path`, `box`, `cue`, `seconds`, `color`, `lineWidth`, `fill`. They also accept `enter`, `exit`, and `animate` tracks for `x`, `y`, `scale`, `rotate`, `opacity`, using existing phrase cues and interpolation. Translation is in output pixels, rotation in radians, and transforms pivot on the box center. Scale also scales stroke width.
- Inline drawings used by visual pauses need stable `id` values. Every drawing-first path needs an explicit cue. Library cues and tracks use the project timeline, not scene-local time.
- Drawing-first label items accept `cue`, `exit`, `x`, `y`, `width`, plus existing `id` and `text`. Labels use 40px text with no panel. Defaults place labels below the drawing; author positions to keep them clear of lines.

Example of a purposeful pause in `speech.json`:

```json
{"kind":"visual","seconds":3,"reason":"Draw the evidence supports","actionIds":["supports"]}
```

Put it in a phrase's `after`. The timing pass counts embedded silence as well as added padding. Project validation requires named actions to cover the actual speech-end to next speech-start interval with drawing or changing transform tracks. Missing actions, static holds and gaps are rejected. Check playback too: moving geometry alone cannot establish meaning or comprehension.

The shared workspace controls transformed stroke bounds and the content-only stillness crop. Layout/caption options and expanded geometry participate in render caching. Do not disable collision or stillness checks to pass an unsuitable composition.

## Production workflow

From the repository root:

1. Run `node sys/engine/studio.mjs doctor`; use `setup` for missing dependencies. Create a project with `new-video-from-topic --slug NAME --topic "TOPIC"` (or `new-video-from-research --input PATH`). The scaffold is deliberately unfinished; author the content.
2. Write `storyboard.md` or JSON with 18–24 beats: initial object → action → result → narration → labels → carried objects. Record claim/source/date in `sources.md`. Mark invented examples “Minh họa”.
3. Fill `narration.json`: `{"durationRange":[158.5,173.5],"phrases":[{"id":"p1","sceneId":"s01","text":"Lời dẫn tiếng Việt.","role":"body","after":{"kind":"sentence"}}]}`. Use stable IDs and semantic phrases. Roles: hook, body, close. Do not set a fixed targetSeconds before measuring. Run `voice --slug NAME`: two Adam takes per phrase, measured selected audio, takes.json, speech.json, timeline.json. Automatic take selection checks silence only; review pronunciation if audio playback is available. Set `take: 1` or `2` to preserve a reviewed selection. Revise narration if measured length falls outside the range; never stretch silence or slow voice to fill time.
4. Author project.json using the measured timeline. Use `cue` and `endCue` objects such as `{"phrase":"p1","edge":"speechStart"}` and `{"phrase":"p1","edge":"speechEnd"}`. endCue replaces seconds; both together are invalid. Scene boundaries also use phrase cues; omit final scene end to follow targetSeconds. Regenerate any calculated offsets when a take changes. Keep `layout: "drawing-first"`, `captionMode: "sidecar"`, `styleReviewStatus: "approved"`, `approved: true`, `audioMaster: "master.wav"`. No outputLayouts, framedTitle, publication wrapper, logo, or scene camera overrides. Shared drawingLibrary references preserve geometry and timing across scenes.
5. Run `validate --slug NAME`, then `preview --slug NAME --start 0 --end 38`. Inspect moving strokes, phone-size key frames, muted comprehension, labels and speech synchronization. Repair problems, then `render --slug NAME`. Use `resume --slug NAME` after interruption; validated chunks and unchanged voice takes are reused. Run one render at a time on memory-constrained machines.
6. Follow [identity assembly](identity.md): provide a short `keyword`, budget the body separately, and let studio attach the intro/outro and shift captions. Check the full MP4 decodes and plays, duration 165–180 seconds, picture 1080×1920 at 30fps, SRT timing, audio loudness and no visual violations. Deliver final.mp4, final.srt, cover.png, storyboard, sources and qa.md. Record listening/playback limits and any manual intervention. The final cover uses the intro at 0.9 seconds. Never claim audience retention without actual platform data.

All commands above use `node sys/engine/studio.mjs COMMAND`. A topic is sufficient for an execution-capable AI to author a new video; the CLI supplies tools, not automatic topic-to-story intelligence.

## Runnable narrated example

See `sys/engine/examples/bridge/`. From the repo root run:

```sh
python3 sys/engine/examples/bridge/build.py init
node sys/engine/studio.mjs voice --slug example-bridge
python3 sys/engine/examples/bridge/build.py visuals
node sys/engine/studio.mjs validate --slug example-bridge
node sys/engine/studio.mjs preview --slug example-bridge --end 38
node sys/engine/studio.mjs render --slug example-bridge
node sys/engine/studio.mjs resume --slug example-bridge
```

The narration is intended for about three minutes. TTS varies: if the measured duration fails, edit the example project's narration, regenerate changed takes, then rebuild visuals. Review the preview before full render. Audio/video/models are generated locally and are not in Git. The separate drawing-first.mjs fixture is a silent three-second geometry test only.
