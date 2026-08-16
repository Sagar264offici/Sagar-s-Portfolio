# 3D Models — Solar System GLBs

Drop the GLB files here and the site loads them automatically. No code changes needed —
a planet uses its real 3D model when the file exists, and falls back to the procedural
surface when it doesn't.

## How to get the files (2 minutes)

The models come from this Sketchfab collection by **3dmigos**:

> https://skfb.ly/oOEAK — "Solar System gltf"

Sketchfab requires a free login to download (the site cannot fetch them itself —
their API rejects anonymous downloads).

1. Open the link, log in / create a free account.
2. Click **Download 3D model** on each of these 6 models:
   - **The Moon**
   - **Earth**
   - **Mars**
   - **Jupiter** (either variant — "Jupiter - Free Downloadable Model" or "jupiter")
   - **Saturno v1.1** (this one is animated — bonus ring motion)
   - **Uranus**
3. Each download is a ZIP. Unzip it, find the `.glb` file inside, and rename it:

   | Model    | Save as          |
   | -------- | ---------------- |
   | The Moon | `moon.glb`       |
   | Earth    | `earth.glb`      |
   | Mars     | `mars.glb`       |
   | Jupiter  | `jupiter.glb`    |
   | Saturno  | `saturn.glb`     |
   | Uranus   | `uranus.glb`     |

4. Move the six `.glb` files into this folder (`public/models/`).

That's it. The moon and the five project planets (Quiz Battle = Jupiter, Greens Cafe =
Earth, Daitya Legion = Mars, Dentist = Uranus, Cricket Field = Saturn) will render as
the real models on the next `npm run dev` / build.

## Notes

- **License:** these models are **CC Attribution** (CC-BY) — you can use them freely,
  but the author must be credited. The site footer should include a line like
  *"Planet models by 3dmigos via Sketchfab"* once the files are added.
- **File size:** the six GLBs are roughly 2–6 MB each — fine for Vercel/Netlify.
- The skill/dwarf planets stay procedural on purpose (TypeScript as Mercury would be
  confusing); only the real celestial bodies use models.
- Want the Sun swapped in too? The collection has "Sun" / "The Sun" — save as
  `sun.glb` and ask, and I'll wire it into the career sun (the lens flare + corona
  stay intact).
