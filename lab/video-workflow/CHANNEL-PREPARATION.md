# Channel preparation contracts

Add an optional `channel` object to `episode.json` for new work. Old episodes without it retain their existing behavior. These checks validate preparation structure, not factual accuracy, audience suitability, or final editorial approval. A passing validator does not mean checked sources or supported claims: honest draft states are allowed.

Integration in `workflow.py`: import `validate_channel` from `channel_schema` and call `validate_channel(s)` inside `load`, immediately before `return folder,s`. No dependencies are required. Run `python3 -m unittest discover -s lab/video-workflow -p test_channel_schema.py -v`.

The fragments below extend a normal episode package; retain all existing episode fields, scene timing, required files, and asset attribution. The legacy science validator also expects each source's `claim` field, which the science template retains.

## Science

`kind: science` requires `domain: science`. `content_type` is one of `explain`, `tutorial`, `news`, `paper-review`, `scientific-writing`. Each claim references known source IDs. Each source records its URL, title, publication date, source type, peer review status, and actual inspection status.

```json
{
  "domain": "science",
  "channel": {
    "kind": "science",
    "content_type": "explain",
    "claims": [
      {
        "id": "claim-1",
        "text": "Replace with the exact claim proposed for narration.",
        "source_ids": ["source-1"],
        "status": "unverified"
      }
    ]
  },
  "sources": [
    {
      "id": "source-1",
      "url": "https://example.org/replace-with-actual-source",
      "title": "Replace with the actual source title",
      "claim": "Replace with the claim this source is intended to support",
      "published": null,
      "published_note": "Publication date has not yet been established.",
      "source_type": "other",
      "peer_review": "unknown",
      "checked": false,
      "checked_date": null
    }
  ]
}
```

This is an unverified placeholder, not usable research. Replace its URL and content before production. Dates use `YYYY-MM-DD`. `published: null` requires an explanation in `published_note`. `source_type` is `paper`, `preprint`, `official`, `book`, `news`, or `other`; `peer_review` is `yes`, `no`, or `unknown`. Do not infer peer review just from a URL or a paper-like title.

Only record `checked: true` after actually inspecting the source, together with `checked_date` and a specific `check_note` (for example which methods, results, or limitations were inspected). Checked means inspected, not proven correct. A claim may be `unverified`, `supported`, or `disputed`; the latter two require an `assessment` and checked referenced sources. The validator cannot detect fabricated review notes; reviewers must verify these assertions themselves.

Preparation emphasis by content type:

| Type | Required editorial work before production |
| --- | --- |
| explain | State scope, underlying mechanism, and limits of analogies. |
| tutorial | Record prerequisites, reproduce steps, and state expected results. |
| news | Separate event date from publication date; check recency and distinguish findings from headlines. |
| paper-review | Read methods and limitations; distinguish preprint status, authors' results, and your interpretation. |
| scientific-writing | Identify audience and genre; use traceable citations and label illustrative examples. |

Keep this work in `script.md`, `checks.md`, and `handoff.md`; metadata completeness alone does not complete it.

## Storytelling

`kind: storytelling` requires `domain: story`. Choose `truth_status` from `fiction`, `composite`, `documented`, or `factual` and write an audience-facing `truth_disclosure`. Fiction/composite must not imply that invented people, dialogue, or events are documented facts.

```json
{
  "domain": "story",
  "channel": {
    "kind": "storytelling",
    "truth_status": "fiction",
    "truth_disclosure": "This is a fictional story.",
    "character_bible": [
      {
        "id": "mai",
        "name": "Mai",
        "appearance": "Short black hair, ochre jacket",
        "voice": "Calm, deliberate speech",
        "invariants": "Carries a blue notebook; jacket and hairstyle stay consistent."
      }
    ],
    "continuity_checks": [
      {
        "scene_id": "opening",
        "character_ids": ["mai"],
        "status": "pending",
        "note": "Compare jacket, notebook, hairstyle, and voice with the character bible."
      }
    ]
  }
}
```

Use actual scene IDs and add a continuity check for every scene. Check statuses are `pending`, `pass`, or `fail`; only record `pass` after review. Known character IDs are enforced. A story without characters may use an empty bible and empty `character_ids`, but still needs scene checks for objects, setting, chronology, and visual continuity. The validator checks references and coverage, not image similarity or continuity itself.

For `documented` and `factual`, add `channel.claims` and top-level `sources` with the same evidence contract as science. Document dramatization or uncertain dialogue in `truth_disclosure` and the script. Composite stories should disclose the composite nature; factual assertions embedded in fiction/composite still need editorial sourcing even though the structural validator does not require an evidence ledger for those modes.

Before handoff, resolve failed continuity checks, review pending work, place truth disclosures in the actual narration or visuals as appropriate, and record unresolved evidence limitations. This contract intentionally permits incomplete draft review states; it does not automatically block rendering or certify publishing readiness.

### Chốt sẵn sàng

`validate` chấp nhận trạng thái biên tập đang làm dở để hỗ trợ chuẩn bị. `ready` chỉ chấp nhận các claims đã supported và continuity_checks đã pass. Những trạng thái này do agent kiểm tra nội dung ghi lại; công cụ không tự chứng minh phát biểu đúng. Không đổi nhãn để vượt bước kiểm tra.
