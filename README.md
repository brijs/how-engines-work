# How Engines Work: an interactive 3D garage tour

A narrated, hands-on explainer of motorcycle engines. You can spin, zoom and take apart 3D engines, run the four-stroke cycle in slow motion, follow oil, coolant, fuel and exhaust, compare engine layouts by sight and sound, and put three Royal Enfields on the dyno.

[![Live explainer](https://img.shields.io/badge/▶_Live_explainer-brijs.github.io%2Fhow--engines--work-ffb347)](https://brijs.github.io/how-engines-work/)

**Live:** https://brijs.github.io/how-engines-work/

## What it covers (14 scenes, guided by Ustad the mechanic)
1. Welcome: a running single-cylinder engine you can orbit, pan and zoom
2. Anatomy: an exploded view with clickable parts (piston, rod, crank, valves, cams, plug, chain…)
3. The four-stroke cycle: play, pause, scrub 0–720°, a cutaway with coloured gas, and a "name the stroke" check
4. Camshaft and valve timing: a 2:1 chain drive, cam lobes shaped from the lift curve, a synced valve-lift chart and overlap
5. Air, fuel and spark: air-fuel ratio, spark advance and knock (illustrative model); carburettor vs EFI
6. Two-stroke vs four-stroke side by side, with a power-pulse counter
7. Cooling: air, air-oil and liquid (pump, radiator, thermostat, fan), with a temperature sim
8. Lubrication: wet vs dry sump, the pump, filter and galleries, and a "drain the oil" demo
9. Breathing: air box → throttle → port, tank → pump → injector, header → catalytic converter → muffler
10. Layouts: single, parallel twin (360/270/180°), 45°/90° V-twin, boxer, inline-3, inline-4, with a firing timeline and synthesized sound
11. Torque, power, rpm and gears (kW = N·m × rpm ÷ 9549), plus tractive force per gear
12. Royal Enfield on the dyno: Classic 350, Himalayan 450, Interceptor 650
13. Engine Lab (free play)
14. Final quiz plus a copyable cheat sheet

## Rebuild
```bash
# narration (Kokoro TTS; models cached in ~/.cache/kokoro)
python tts.py          # use a Python with kokoro-onnx, soundfile (and imageio-ffmpeg or ffmpeg)
python3 build.py       # writes dist/how-engines-work.html and docs/index.html (served by GitHub Pages)
python tests/walk.py   # Playwright walkthrough at 1280px and 390px; prints any errors
```
The source lives in `parts/` (`head.html`, `engine.js` for the core runtime, `gl.js` for the three.js engine model, and `scenes1-3.js`). three.js is vendored in `vendor/three-bundle.js` (tree-shaken with esbuild from `vendor/entry.js`). The output is a single self-contained HTML file.

## Sources and caveats
- Royal Enfield Classic 350 technical specification sheet: 349 cc, 72 × 85.8 mm, 9.5:1, 20.2 bhp @ 6100 rpm, 27 N·m @ 4000 rpm.
- Himalayan 450 (Sherpa 452) published specifications: 84 × 81.5 mm, 11.5:1, 40.02 PS @ 8000 rpm, 40 N·m @ 5500 rpm, liquid-cooled DOHC.
- Interceptor 650 published specifications: 648 cc, 78 × 67.8 mm, 9.5:1, ≈47 PS @ ≈7150 rpm, ≈52.3 N·m @ ≈5150 rpm. Royal Enfield's 650 twin reveal: 270° crank and gear-driven balancer. Third-party listings differ slightly on the rpm points.
- The dyno **curve shapes are illustrative** interpolations through the published peak points (Royal Enfield does not publish full curves). Valve timing, gear ratios, the mixture/knock model and the temperatures are illustrative too.
- three.js (MIT). Narration voice: Kokoro TTS (`am_michael`).
