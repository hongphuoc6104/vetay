# Drawing-first video production

Use when the user chooses illustrated storytelling with guided Adam narration. This is an opt-in extension of net-cinematic-v1, not a replacement renderer. Existing projects keep their original defaults. The channel owner approved both drawing-first and framed freehand styles on 2026-09-16. Preserve this approval for new videos in these styles; use styleReviewStatus: approved. Other new layouts still require their own review.

## Story before narration

Write 18–24 visual beats per approximately three-minute episode. Record the initial object, drawing action, resulting state, supporting narration, visible labels and carried objects. Give each episode one question, one concrete situation and one usable outcome. Research factual claims and keep metaphors distinct from evidence. Label invented examples “Minh họa”.

Start with a visual tension. Use persistent objects and meaningful changes rather than repeated title panels. Keep labels to 1–4 whitespace-separated words, at most two simultaneously. Sidecar subtitles retain the full spoken text. The final frame may express the takeaway with a short label; richer explanation stays in narration or the description.

Produce two Adam candidates for each changed semantic phrase. Measure the selected final-speed WAVs. Treat beat timestamps as editorial budgets until audio is measured. Do not slow the narrator or stretch a static frame to hit a duration. Prefer drawing during narration. A short silent observation may use the existing visual pause of 2–4 seconds. For guided samples aim for 75–85% voiced time, measured from speech windows; do not force this editorial target by changing voice speed.

## Project interface

- `layout: "drawing-first"` selects a clean paper canvas with workspace x=80..1000, y=220..1610. Headers, chapter ribbons, permanent titles and the progress bar are absent. The template must be `freehand`; no scene camera override.
- `captionMode: "sidecar"` removes burned-in captions and still exports SRT. Omitted options preserve legacy presentation and burned-in captions.
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

## Review and delivery

1. Write the visual storyboard, then guiding narration: direct attention, explain the relationship, carry the object into the result. Self-review a real 35–40-second passage in both layouts with identical audio.
2. Inspect the encoded passage, intermediate stroke frames, transitions, phone-size readability and sound. Report any listening/playback limits honestly. Both existing styles are approved; do not repeat their approval request. Review new layouts only when introduced.
3. After approval record `styleReviewStatus: "approved"` in each authorized production project. Produce episode one, correct it, then episodes two and three. Candidate preview production uses `studio.mjs preview`; full `render`/`resume` requires the style approval flag for drawing-first projects.
4. Run timing, drawing/browser, compatibility and transport/cache checks; deliver MP4, SRT, cover, storyboard and QA record. Keep source and takes under sys/work; only deliverables go under video.
5. Social publication and audience feedback are separate later stages. If access/data is absent, leave metrics unavailable; do not invent retention results or label a topic trending without evidence.

## Guided narration and dual export

Use the same shared engine and one canonical drawing project; do not copy a private demo generator.

1. Author `narration.json` in the project work directory: `{ "durationRange": [35,40], "phrases": [{"id":"p1","sceneId":"s1","text":"Your Vietnamese narration.","role":"body","after":{"kind":"sentence"}}] }`. Use short semantic phrases suitable for two-line captions. Roles are `hook`, `body`, `close`. Keep stable IDs. A fixed `targetSeconds` is optional; otherwise the helper uses measured duration rounded to 30fps. Do not put an artificial exact duration on exploratory narration.
2. Run `node sys/engine/studio.mjs voice --slug NAME`. This loads Adam once, produces two cached takes, keeps originals and processed takes, measures silence, and writes `takes.json`, `speech.json`, `timeline.json`. Automatic selection checks silence only; audition pronunciation and delivery. To select a reviewed take, put `take: 1` or `take: 2` on that narration phrase and rerun. If outside durationRange, revise meaningful content and rerun; do not pad silence.
3. Draw during those phrases: use `cue` and optional `endCue` referring to measured phrase start/end. `endCue` replaces `seconds`; specifying both is invalid. It propagates changed audio duration to drawing progress, validation and cache. For a visual pause its action must genuinely span the pause.
4. Use `layout: "drawing-first"`, `drawingCoordinateLayout: "drawing-first"`, `outputLayouts: "both"`, `styleReviewStatus: "approved"`, and approved scene content on your authored project. Give each scene `framedTitle` with up to two short lines fitting the old header. Keep only useful short labels; they take extra space in classic mode. For both layouts use drawings predominantly in y=300..1250 and reserve a lower zone for labels.
5. `studio.mjs render --slug NAME --layout both` measures/assembles audio once and exports drawing-first.mp4 and classic.mp4 with corresponding SRT/covers. Layout values are `drawing-first`, `classic`, `both`; omitted flags preserve existing behavior. `new-video-from-topic ... --layout both` scaffolds a freehand workspace. The reusable fit helper applies a uniform scale and translates geometry and movement tracks into the target workspace. It does not scale font sizes; inspect labels separately.
6. Keep final deliverables only under video. Logs, takes, snapshots, scripts and intermediate manifests stay in sys/work or sys/cache.

The self-contained neutral example is `node sys/engine/examples/drawing-first.mjs`. It creates a silent 3-second geometry fixture to test development, not a production video. Render via the documented low-level renderer; narrated videos use voice + studio. Generalization still requires an agent to author meaningful paths for the topic. Test transfer with an independent agent using only this package and a fresh brief; state exactly which runtime was tested.

Plain short labels may set `plain: true`, keeping their font size while mapping their anchor into the other layout. Retire props and marks when their explanation ends; do not accumulate unrelated objects into later scenes. On memory-constrained machines synthesize voices first, then render one project at a time; verified chunks allow resume.
