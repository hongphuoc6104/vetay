# Template-first entry
For new projects, [templates.md](templates.md) supersedes raw component authoring below. Use content slots and measured phrase cues. Keep raw components for existing projects and approved engine work.

# Produce a Nét video from a fresh checkout

All commands run from the repository root. Replace `lesson` with the project's lowercase slug. This workflow supplies the missing production context; do not search for the private demo, its narrator scripts or previous chat history.

## 1. Establish the working environment

Read root `AGENTS.md`, this skill, `production.md` and `publication.md`. Confirm that local file access, shell execution and a browser are available. Run:

```sh
node sys/engine/studio.mjs setup
node sys/engine/studio.mjs doctor
```

On a new machine, render the neutral three-second integration example once:

```sh
node sys/engine/examples/create-neutral.mjs
node sys/engine/visual/render.mjs --project sys/work/neutral/project.json --timeline sys/work/neutral/timeline.json --output sys/work/neutral/output
```

Open it and check that the pen stroke develops, the list reveals progressively and fonts render. This is a runtime check, not the user's video. If it fails, diagnose the reported missing dependency, font or asset; do not silently switch to a slideshow renderer. If execution access is absent, report that capability gap rather than claim installation completed.

## 2. Turn the topic into an approved scene outline

```sh
node sys/engine/studio.mjs new-video-from-topic --slug lesson --topic "Requested subject" --duration 360
```

For supplied research use `new-video-from-research --slug lesson --input PATH --duration 360`. The helper creates files only; you must research and author the content.

Create `brief.md` inside the project with audience, learning outcome, target duration and topic boundaries. Read primary sources for claims that need verification. Keep research and provenance locally. Propose scenes with: what the viewer learns, narration summary, evidence/action shown, and takeaway. Ask for approval of these contents once. Preserve prior approval. Do not treat a scaffold as an approved script.

Before authoring scenes, fill `publication.title`, `primaryKeyword`, `seriesLabel` and `coverFrame`. Keep the first scene's keyword and title readable at frame 0. Give the final scene one to three concise takeaways or use `outro.takeaways`; select the avatar with `avatarTheme: "scene"` unless a fixed theme is intentional.

## 3. Decide what changes on screen

Read `clean-pen-direction.md`. For each scene record in local `direction.md`:

- The starting object: an actual capture, a video, or an explicitly labeled explanatory diagram.
- The spoken fact that needs a visual anchor.
- The pen action and its exact target: underline a phrase, enclose a region, or connect cause to result.
- The visible change after that action, and the state carried into the next scene.

Example: “The user supplies a time limit → underline that phrase → carry the same value into the answer → compare the result with that limit.” Avoid describing motion merely as “add cinematic effects.”

## 4. Produce narration and measure it

Read `pause-policy.md` and `adam-delivery.json`. Use local VieNeu v3 Turbo, Adam, with the selected delivery profile. Write project-local synthesis code if required; setup installs the runtime, not a universal narration script. Inspect the installed VieNeu interface rather than assuming a demo helper exists.

Create two takes for changed sentences or coherent phrases. Very short isolated words can sound abrupt; prefer full phrases unless deliberate separation helps. Select for intelligibility, pronunciation and delivery; transcription is only supporting evidence. Preserve raw and processed takes locally. Export final-speed 48kHz PCM 16-bit WAVs; do not slow them to fill a scene.

Fill `speech.json` using the pause-policy schema. Phrase IDs remain stable so all visual events refer to them. Measure and build:

```sh
python3 sys/engine/timing.py sys/work/lesson/speech.json --output sys/work/lesson/timeline.json
```

Resolve every reported overlap, long silence or duration mismatch through take choice, useful script revision or explicit practice. A duration range permits choosing a natural duration within the user's range; an exact duration requires measured adjustment. Do not add unexplained silence. No scene visual code should invent a second independent speech clock.

## 5. Compose one real passage with shared components

Read `visual-authoring.md` for supported fields. Replace the generated neutral content in `project.json`; retain preset/version/format. Use the branded paper surface, readable type and the light/dark roles from the production contract. Build only the content-specific scene data under `sys/work/lesson/`; do not replace `visual/render.mjs`.

Add actual media only when it helps the explanation. An image is a source object, not a complete precomposed slide. Use large crops, source/result continuity and pen highlights around it. A fictional chat interface must be marked as an illustration.

Bind draw progress and reveal to measured phrase cues. Reuse the same content object or value across related scenes. Select one visual focus at a time; a motion should end in a readable, stable state.

## 6. Preview and self-correct

After the user approves the scene outline, record `approved: true` in the manifest. Preview a real 10–20-second passage containing a pen action and a transition; use the actual narration, not the neutral fixture:

```sh
node sys/engine/studio.mjs preview --slug lesson --start 0 --end 15
```

Inspect start/middle/end frames of the pen action and play the passage. Check at phone viewing size. Confirm actual content motion, not just changing subtitles. Check the composition and repair instructions in `clean-pen-direction.md`.

Correct content JSON and re-preview affected scenes. Do not request approval of each effect. If the user explicitly requested a short trial before the long film, deliver that trial and wait for their feedback before the full render.

## 7. Render and verify the requested deliverable

```sh
node sys/engine/studio.mjs render --slug lesson
```

The studio validates timing, assembles a narration master and invokes the shared renderer. For a custom music/foley mix use the documented low-level render path so the studio does not overwrite it.

Read `visual-report.json` and review any holds. Decode/check exact duration, full playback, Vietnamese text, clipping, transitions and final encoded loudness. Inspect all scenes, not only the cover. If a check cannot be performed, state that clearly; do not equate a successful tool exit with a creative-quality review.

On interruption, use `resume --slug lesson`; check the report for reused frames. Keep old user-approved outputs under distinct local filenames before replacing deliverables.

## 8. Deliver and preserve reusable improvements

Deliver the MP4, subtitles, cover, scene outline, publishing notes (`*-publishing.json` and `*-publishing.md`) and concise verification result under `video/<category>/<slug>/`. Check frame 0, the configured cover frame, the transition into the body and the final avatar frame. Explain only material limits. Do not claim another agent/model has been independently validated unless it actually produced a video from this repo without extra private context.

Keep outputs, takes, sources and video-specific code outside Git. Improve the shared skill/components only when a concrete failure justifies it; publish those changes only within the user's authorization. No architecture diagrams or experimental media belong in the public commit.
