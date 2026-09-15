# Templates, free drawing and efficient export

Read before authoring a new video. Run `node sys/engine/studio.mjs templates` for the actual catalog. Select a template by what the audience needs to understand, not by visual variety. Templates currently marked `candidate` need a user-reviewed passage before being promoted to a standard style. The approved four-demo request authorizes preview production; it does not approve their appearance in advance.

## Production sequence
1. Setup and doctor; inspect the catalog and this interface.
2. Research, outline scene contents and obtain the existing one-time content approval.
3. Produce Adam takes and a measured timeline using the existing audio references. Fill scene template slots using phrase IDs; do not guess word timings.
4. Validate the project and preview an actual short passage. Inspect each transition, pen action and final frame. Check phone readability and play the moving video.
5. If no template fits, first split or shorten the content. A new drawing inside `freehand` is permitted without asking for every stroke. A new layout/template or a change to the standard library requires a local 10–20 second candidate preview and user review. Do not change the validator to evade an error.
6. Render with the default binary transport. Resume uses verified video chunks, not thousands of image files. Deliver the final files and state any unverified aspects.

## Content-only scene interface
Keep `stylePreset: net-cinematic-v1`, `rendererVersion: 1.0.0`, `format: {width:1080,height:1920,fps:30}`, brand palette and scene coverage as before. A template scene replaces `elements` with `template`; do not supply both or add a scene camera override.

```json
{
  "id":"clarify", "start":0, "end":10,
  "role":"body", "theme":"auto", "label":"LÀM RÕ YÊU CẦU",
  "title":["Một ý cụ thể."],
  "template":{
    "id":"cards", "version":"1.0.0",
    "items":[
      {"id":"goal","label":"MỤC TIÊU","text":"Nêu kết quả cần đạt.","cue":{"phrase":"p1"}},
      {"id":"result","label":"ĐẦU RA","text":"Chọn cách kiểm tra kết quả.","cue":{"phrase":"p2"}}
    ],
    "annotations":[{"kind":"underline","targetId":"goal","cue":{"phrase":"p1","offset":0.8}}]
  }
}
```

`focus` allows one item; `compare` allows two; other templates allow up to three. Use short meaningful authored text: items longer than 110 characters or labels longer than 30 are rejected. Actual font measurement may require splitting earlier. `focus` exposes annotation target `focus`; other templates use item IDs. A line is not a compulsory slot: do not fill space with unnecessary facts.

- `focus`: one main question or takeaway, large central panel.
- `cards`: up to three items, optional `mergeCue` to collect them into one workspace.
- `steps`: ordered items connected in vertical sequence.
- `compare`: two full-width states; use labels to identify them.
- `recap`: three aligned takeaways; use scene `logo:true` for the closing brand.
- `freehand`: `drawings` plus optional items below the drawing. Paths can explain an object, concept or relationship; do not present a conceptual brain drawing as neuroscience evidence.
- `layers`: three geometry layers. `splitCue` opens them, `joinCue` collects them; item labels remain in screen space to stay readable.
- `editor`: real captured image/video in `src`; for video specify `mediaType:"video"`. Optional `sourceStart` is a seconds offset. Capture actual operations and record provenance; label purpose-built local applications. Image annotations need measured `protectedRegions` in output coordinates. Never pretend a screenshot is an interactive application.

## Drawing contract
A freehand drawing has `path` (SVG path geometry only), `box:[x,y,width,height]`, `cue`, optional `seconds` (default 1.8), `color` (brand token), `lineWidth` and `fill`. Paths use a normalized 0–100 coordinate space. Several paths with distinct cues provide lift–draw–lift sequencing. Geometry is deterministic; do not generate random points on every frame. A completed filled path uses a faint fill behind its outline. Keep all paths and text in the safe drawing workspace.

Annotations support `underline`, `circle`, `arrow` (with `toId`) and `strike`. An underline runs below measured glyph bounds; a circle sits outside them. Arrows use an outside corridor. If collision checking rejects an arrow, split or rearrange the scene; do not turn checking off. `strike` requires the target item to declare `incorrect:true`; it cannot cross other text. A small pen tip avoids obscuring letters.

The current templates use fixed coordinates and prohibit custom scene camera transforms. Their stroke/text collision checks run in that shared coordinate system every rendered frame. Three-dimensional labels remain screen-space text; do not add labels to arbitrarily rotated surfaces and assume they have passed this check. Keep subtitles and titles outside the drawing workspace.

## Export and troubleshooting
- `preview`, `preview-template`, `render`, `resume`: default `--transport binary-pipe` sends binary PNG directly into FFmpeg and stores H.264 chunks up to 300 frames. This still encodes PNG in Chrome; it is not zero-copy.
- `--transport legacy-png`: explicit diagnostic comparison only; writes per-frame PNGs. Never silently fall back to this mode.
- `validate`: checks the project and measured timeline before expensive work; rendering is still required to check glyph layout and strokes.
- `cache`: dry-run inventory. `cache --key <exact-key> --delete` removes only that cache entry when cleanup is requested. Do not erase unrelated caches automatically.
- Cache keys include source, assets, font, timing, style and encoder. Hash-verified complete chunks survive interruption. Never reuse `.partial.mp4` files.
- Performance JSON distinguishes browser drawing, PNG encoding, upload and encoder write wait. Upload includes write wait; do not add overlapping numbers to claim a percent bottleneck. Linux process-tree RSS can count shared memory more than once.
- Preserve the user's prior requirements in production.md, pause-policy.md and adam-delivery.json. Successful encoding or the right palette is not proof of good visual direction.
