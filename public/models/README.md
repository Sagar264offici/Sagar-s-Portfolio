# 3D Models & Textures — Solar System

Two independent systems here:

1. **Real 2K textures** — `Planets_Blendfile_Textures/` (already wired in, live now)
2. **GLB models** — drop `.glb` files here and planets render as real 3D geometry

## 1. Textures — ACTIVE ✅

The `Planets_Blendfile_Textures/Textures/` pack (from the same 3dmigos collection) is
loaded automatically by `src/three/realTextures.ts`. The moment a file exists it
replaces the procedural surface on that body — no code changes needed:

| Texture file              | Used on                                            |
| ------------------------- | -------------------------------------------------- |
| `Sun/2k_sun.jpg`          | The career sun (sunspots included)                 |
| `Moon/2k_moon.jpg`        | The moon                                            |
| `Mercury/2k_mercury.jpg`  | Mercury-styled skill planets                       |
| `Venus/2k_venus_surface.jpg` | Venus-styled skill planets                      |
| `Neptune/2k_neptune.jpg`  | Neptune-styled skill planets                       |
| `Erath/2k_earth_daymap.jpg` + `2k_earth_clouds.jpg` | Greens Cafe (daymap + drifting cloud layer) |
| `Mars/2k_mars.jpg`        | Daitya Legion                                       |
| `Jupiter/2k_jupiter.jpg`  | Quiz Battle                                         |
| `Uranus/2k_uranus.jpg`    | Dentist                                             |
| `Saturn/2k_saturn.jpg` + `2k_saturn_ring_alpha.png` | Cricket Field (real ring strip, UV-remapped) |

Missing/corrupt files are harmless — the body just keeps its procedural surface.
Planets with no real map in the pack (Pluto, rocky/icy dwarfs) stay procedural.

## 2. GLB models — how to activate

`Planets.blend` is a **Blender source file** — browsers can't load `.blend`. To use
the actual 3D geometry you must export it to `.glb` **inside Blender**
(File → Export → glTF 2.0, or `blender --background Planets.blend --export-glb ...`),
then drop the renamed files here:

| Export as      | Renders on            |
| -------------- | --------------------- |
| `moon.glb`     | The moon              |
| `earth.glb`    | Greens Cafe           |
| `mars.glb`     | Daitya Legion         |
| `jupiter.glb`  | Quiz Battle           |
| `saturn.glb`   | Cricket Field         |
| `uranus.glb`   | Dentist               |

Planets use the real model when the file exists, procedural (with real textures)
otherwise — no code changes needed either way.

## Notes

- **License:** models and textures are **CC Attribution (CC-BY)** — credit the author
  (3dmigos via Sketchfab) once real models/textures are visibly shipped. The footer
  should carry a line like *"Planet models by 3dmigos via Sketchfab"*.
- **`Planets.blend` in `public/`:** it ships with the deploy and is never requested
  by the site. If you want the repo leaner, move it out of `public/` (e.g. into a
  root `models/` folder) — say the word and I'll relocate it.
- The skill/dwarf planets stay procedural on purpose (TypeScript as Mercury would be
  confusing); only the real celestial bodies use the pack.
