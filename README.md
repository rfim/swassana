# Swassana Studio landing page

Static landing page for Swassana Studio (Surabaya) and Casa de Swassana (Malang). It is plain HTML and CSS with no build step, served by GitHub Pages.

Booking links go to the live booking flow at `swassanastudio.com/booking/<city>`.

To publish, open Settings → Pages, choose "Deploy from a branch", then `main` and `/ (root)`.

## Pages

- `index.html`: home with booking, maps, booking steps, the Ide Pose generator, Jurnal, FAQ and Instagram links
- `blog/`: Jurnal articles (SEO), with `sitemap.xml` and `robots.txt`
- `photobooth.html`: camera photobooth game with frames, filters, countdown, shake to shoot, and share
- `kuis.html`: "Kamu tipe sesi apa?" quiz with a 3D background, tilt and shake, and a shareable Story card
- `js/fx.js`: shared three.js scene (floating polaroids) plus phone helpers (tilt, shake, vibration, share)
- `team.html`: team page; edit the `TEAM` list at the bottom of the file
- `preview.html`: interactive iPhone and Android preview
- `previews/`: static phone screenshots

## Editing

- **Exact map pins:** in `index.html`, find `PLACES` and replace each name with `"lat,lng"`.
- **Team photos:** put them in `img/team/` and set `photo: 'img/team/name.jpg'`.
- **Installable app:** `manifest.webmanifest` and `icons/` make it installable on iOS and Android.
