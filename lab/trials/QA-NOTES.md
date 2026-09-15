# Reproducible trial QA

Run `python3 lab/trials/qa.py` to inspect existing prepared episodes sequentially. Missing previews/finals are reported `pending`, never passed. `--kind preview` or `--kind final` restricts work; episode IDs restrict inputs. Reports and contact sheets stay in the shared `trials` cache. The checker uses system Python/Pillow, ffprobe and FFmpeg with one decoding thread.

Checks cover expected portrait dimensions (preview 540×960, final 1080×1920), 30 fps, duration within 120 ms of frame timeline, audio stream presence, whole-file decoding, contiguous scene timelines, narration within scene, caption bounds/text coverage, SRT count, conservative caption text width/height and numeric audio signal. Silence uses −45 dB and 0.5-second minimum; more than 35% is a pacing warning, 98% or greater fails the signal check. Contact sheets show one representative point per scene, capped at twelve.

These are engineering checks, not speech recognition or audience testing. Caption timing is currently estimated from text length; it is not forced alignment. Font measurement does not reproduce every browser layout detail. Representative frames cannot prove every frame is unclipped. No claim of listening to the audio or watching the complete video is made by this checker. `pass_automated_checks` leaves visual review explicitly required. Reports record file size and modification time to identify stale results after a rerender.

## Initial bounded inspection

Benchmark and vector-01 previews passed full decoding, size/fps, audio signal and caption timeline checks. Visually inspected their contact sheets: Vietnamese glyphs rendered, sampled captions remained inside the canvas, and compositions had visible figures/props. Vector captions sometimes split phrases because the current chunker uses seven words; a sentence-aware chunker would improve readability.

Vector-01 lasts 43.93 seconds, slightly below the planned 45–60-second range. Benchmark lasts 15 seconds but has about 7.89 seconds of detected silence; both scene midpoint samples are after their captions. This should be assessed as pacing, without confusing it with missing audio. Later renders require new checks. Initial final files were not yet available.
