# Production contract

## Visual direction
- Center the content group horizontally and vertically, but left-align multiline prose and lists inside it. Give numbers, checkboxes and text distinct aligned columns. Continuation lines align with text, not numbers.
- Set Vietnamese in Be Vietnam Pro. Wrap at phrase boundaries, preserve accents and punctuation. Never shrink paragraphs to unreadable text to make them fit.
- Use real editable notes or captured application actions as evidence; do not present a static painted UI as a working application. A purpose-built local notes editor is acceptable and must be identified in provenance.
- Use hand-drawn strokes for underlines, circles, connecting arrows and reveal masks. Avoid decorative stock images. Free explanatory drawings, including conceptual objects such as a brain, are allowed when they clarify narration; label conceptual metaphors and keep real evidence distinct.
- Animate continuous objects between states. Camera moves connect related information; do not keep text moving while it must be read. Use Three.js perspective only when depth explains the transition.
- Keep primary content inside x=80..1000, y=220..1610 at 1080×1920. Bottom captions are secondary. No generic title-card slideshow.

## Brand
Technology: navy #071C24, aqua #19D3D0, teal #58C7B6, gold #F4C24E.
Creative: midnight #0B1020, teal #11D7C8, purple #6C63FF, gold #FFC357.
Light background #F7F4EB; dark uses the palette's darkest color. Both templates accept both palettes. Keep supplied light/dark logo files intact.

## Audio
Reference identity: hongphuoc6104/genvideoanimation, VieNeu-TTS v3 Turbo, Adam, ONNX CPU fp32. Use [Adam alert delivery](adam-delivery.json) for this user's preferred delivery: natural 1.0× body, 1.05× hook/close, lighter bass boost and 2:1 compression. The user found the former 0.78–0.88× delivery sleepy; do not restore that slowdown to fill a scene. Preserve raw takes and generate two candidates per semantic phrase using one model load. Check intelligibility and timing; automatic transcription alone cannot establish natural prosody. Normalize final mix near -15 LUFS, encoded true peak <= -1.8 dBTP. Use short purposeful pauses attached to the visual actions.
Log exact takes, measured durations and start/end times. Word emphasis requires measured or reviewed phrase anchors; never claim forced alignment if it was not run.

## Acceptance
Validate against the project target duration and format. Use `pause-policy.md` for silence limits and audio-first sequencing. A fixed 30-second job must contain exactly 900 frames at 30fps; never fill missing time with unexplained silence.
Inspect frames at all transitions and within each scene. Check Vietnamese glyphs, list alignment, contrast, captions, accidental black frames, audio peaks and exact duration. Review full playback when supported and record verification limits.
