# How Engines Work: storyboard

Style: **Garage workshop** (dark workbench, amber work-lights, brushed-metal 3D parts, chalk labels, tacho gauges).
Guide: **Ustad**, a veteran mechanic. The badge on his cap changes with rank: Apprentice → Mechanic → Senior Mechanic → Ustad.
Engine: three.js (vendored inline) for every 3D scene; 2D canvas/SVG for the charts and the flame demo.

| # | Rank | Scene | What the learner does | Takeaway | Engine |
|---|------|-------|-----------------------|----------|--------|
| 1 | Apprentice | Welcome to the garage | Orbit, pan and zoom a running single-cylinder engine on a stand | An engine turns small explosions into rotation | three.js |
| 2 | Apprentice | Anatomy: exploded view | Explode slider; click each part (piston, rings, rod, crank, flywheel, valves, cams, plug, chain, head, barrel) and tick off 6 parts | Name the parts and what each does | three.js + raycast picking |
| 3 | Apprentice | The four-stroke cycle | Play/pause, speed, scrub 0-720°, jump to stroke; cutaway with coloured gas (blue charge, orange burn, grey exhaust) plus a "which stroke?" check | Suck, squeeze, bang, blow: 2 crank turns per cycle | three.js cutaway (clipping planes) |
| 4 | Apprentice | Camshaft, valves and timing | Scrub the crank; watch chain plus 2:1 sprockets, cam lobes and valve lift, with a synced valve-lift chart and overlap highlight | The cam turns at half crank speed; valves open by lobe shape | three.js + canvas chart |
| 5 | Mechanic | Air, fuel and spark | Air-fuel ratio slider (lean ↔ rich), spark-advance slider, carb vs EFI toggle; flame colour, power and knock meters react | ≈14.7:1 stoichiometric; spark timed before TDC | canvas (illustrative model) |
| 6 | Mechanic | Two-stroke vs four-stroke | Toggle; a 3D two-stroke with transfer and exhaust ports, plus a power-pulse counter side by side | Two-stroke = power every turn, simpler, dirtier | three.js |
| 7 | Mechanic | Cooling | Switch air / oil / liquid; ride-speed and temperature sliders; the thermostat opens and coolant flows to the radiator | Fins, oil coolers and radiators move heat away | three.js flow particles |
| 8 | Mechanic | Lubrication | Watch oil travel sump → pump → filter → crank → cam → drain; wet vs dry sump; "drain the oil" shows warning heat | Oil = film + cooling + cleaning | three.js flow particles |
| 9 | Mechanic | Breathing: fuel, air, exhaust | Toggle each path: tank → pump → injector, airbox → throttle → intake valve, exhaust → header → catalyst → muffler; throttle slider | The engine is an air pump; throttle meters air | three.js flow particles |
| 10 | Senior | Engine layouts | Switch single / parallel twin (360/270/180) / 45° and 90° V-twin / boxer / inline-3 / inline-4; firing timeline; "hear the beat" | The layout sets the firing rhythm, smoothness, width and sound | three.js multi-cylinder + WebAudio |
| 11 | Senior | Torque, power, rpm and gears | Twist the throttle (rpm), live P = T×rpm/9549; shift gears and see wheel torque vs speed | Torque = twist, power = rate of work, gears trade one for the other | canvas gauges |
| 12 | Senior | Royal Enfield on the dyno | Toggle Classic 350 / Himalayan 450 / Interceptor 650; hover crosshair; bore × stroke compare | Real peak numbers; long-stroke single vs revvy twin | SVG chart (curves illustrative, peaks official) |
| 13 | Ustad | Engine Lab (free play) | Any layout, rpm, x-ray/cutaway/solid, flow overlays, explode | Put it all together | three.js |
| 14 | Ustad | Final inspection | 8-question quiz (pass 6/8 to earn the Ustad badge) plus a copyable cheat sheet | Keep the cheat sheet | HTML |

Notes
- Royal Enfield peak figures come from official spec sheets and reputable listings. The full curve shapes are interpolated between the published peaks and are marked **illustrative** in the UI.
- Valve timing, gear ratios and the AFR/knock model are typical or illustrative values and are labelled as such.
