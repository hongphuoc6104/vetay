# Direct clean, purposeful pen animation

## What establishes the style

The identity is a spacious paper workspace, clear Vietnamese typography, restrained teal/gold ink, a dark opening/recap when appropriate, and movement that reveals a relationship. The goal is not a literal moving human hand. The renderer's pen tip follows a progressively drawn line; no generated hand footage is needed.

Keep the style preset and shared component implementation. Exercise creativity in the example, shot sequence, source material and explanation, rather than replacing the palette or inventing an unrelated UI design.

## Pick the drawing action from the teaching need

| Teaching need | Use | Result the viewer should see |
|---|---|---|
| Notice an important phrase | Short underline below its baseline | Exact phrase is easier to identify; ink does not cover accents |
| Inspect one region | Circle/ellipse outside its bounds | A clear area of attention; content stays legible |
| Understand a relationship | Line/arrow between source and result | The same fact is visibly carried to its consequence |
| Follow ordered work | Aligned list + cue-based reveal | One new step appears when it is explained |
| See a transformation | Move/reveal a persistent object | Viewer recognizes before and after as the same object |
| Understand overview/detail | A short camera move, then hold | Viewer knows where the detail sits in the whole |

Do not draw a line because the scene otherwise looks empty. First enlarge the relevant content, remove unnecessary text or supply the missing explanatory action.

## Build one drawn emphasis, step by step

1. Place and measure the target text or captured region at final scale.
2. Choose a path below/around it with enough clearance for Vietnamese diacritics.
3. Use `stroke` or `ellipse`, with an animated `progress` from 0 to 1. A full-progress stroke placed at scene start is a static decoration.
4. Anchor the start to the phrase discussing that target. Use a measured offset if a particular word occurs later; do not assume the target is always the first word.
5. As a starting range, draw a short underline in 0.4–0.7s, a circle in 0.7–1.0s, and a longer connecting path in 0.7–1.2s. Adapt to the spoken explanation.
6. Let the finished mark remain while the point is discussed. Remove or de-emphasize it before a conflicting focus appears.
7. Inspect frames at the start, halfway and end. The visible path must genuinely grow. Play it with the narrator to check whether it arrives too soon or too late.

This component is valid inside a scene whose timeline contains phrase `p1`. The target here is a text block starting near x=180, y=730; adjust the path to the actual bounds:

```json
{
  "id": "important-underline",
  "type": "stroke",
  "points": [[180, 802], [340, 807], [590, 802]],
  "color": "teal",
  "lineWidth": 7,
  "pen": true,
  "animate": {
    "progress": [
      {"at": {"phrase": "p1", "offset": 0.15}, "value": 0},
      {"at": {"phrase": "p1", "offset": 0.75}, "value": 1}
    ]
  }
}
```

Use `gold` to highlight the principal takeaway, `teal` for guidance. The colors are renderer tokens, not duplicated hex values.

## Keep the frame clean

- One dominant idea at a time. A title and a focused workspace are usually enough; avoid nested dashboards and several equal-weight cards.
- Center the overall content group. Inside it, align prose/list continuations to the text column. Centering a group does not mean centering every line.
- Use the preset's title and body sizes. Judge final displayed size after camera/group scaling; 44px text scaled to 0.5 is unreadable 22px text even if schema validation accepts it.
- Do not shrink text to fit. Shorten on-screen copy, split by meaning or crop/zoom a real capture. Keep narration richer than the words on screen.
- Ink marks follow the target's movement. A connector should end at the object it explains, not in empty space.
- Use a paper surface with contrasting ink. Verify text against the immediate panel background, not only the scene background.
- Preserve a clear subtitle area. Captions support access; they do not count as the scene's animation or main evidence.

## Use depth without losing clarity

Use `projection` for an establishing paper/media shot or a change in perspective. Start with the shipped neutral pose and a modest rotation/zoom. Settle before sustained reading. Use scene camera zoom for a detail inspection and return to overview when the relation matters. Avoid rotating small text continuously, extreme perspective or motion solely to pass the hold detector.

Transitions connect thought: carry a highlighted phrase into the result, follow the ink line to the next step, or use the shared chapter ribbon when changing topic. Do not stack several wipes or add a fade that hides the intended object continuity.

## Repair a preview that misses the style

| Symptom | Likely cause | Repair |
|---|---|---|
| Looks like narrated slides | Whole images are held; only captions change | Make the information itself evolve using draw/reveal/move with speech cues |
| Correct colors, wrong mood | Dark surfaces everywhere or too many accent colors | Restore role-based light/dark and the paper workspace |
| Empty frame with tiny cards | Content occupies too little of the usable canvas | Enlarge/crop the main subject; use sequential information instead of more cards |
| Busy or messy | Multiple active marks and simultaneous movements | Keep one active focus; retire previous emphasis and end camera motion |
| Pen appears decorative | No link to a spoken fact or target | Reconnect it to a phrase and the exact visual evidence, or remove it |
| Clean screenshots, poor video | Only still frames were reviewed | Watch the real passage; correct timing and continuity |
| Renderer passes but style fails | Mechanical checks were treated as approval | Record the visual issue and fix it; numerical tests cannot judge taste |

The agent must self-check these failures before delivery. This reference does not promise identical artistic judgment across AI models; it makes the intended decisions explicit and the execution reusable.
