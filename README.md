# Swassana Studio landing page

Static landing page for Swassana Studio (Surabaya) and Casa de Swassana (Malang). It is plain HTML and CSS with no build step, served by GitHub Pages.

Booking links go to the live booking flow at `swassanastudio.com/booking/<city>`.

To publish, open Settings → Pages, choose "Deploy from a branch", then `main` and `/ (root)`.

## Pages

- `index.html`: home with booking, maps, booking steps, the Ide Pose generator, Jurnal, FAQ and Instagram links
- `blog/`: Jurnal articles (SEO), with `sitemap.xml` and `robots.txt`
- `photobooth.html`: camera photobooth game with frames, filters, countdown, shake to shoot, and share
- `kuis.html`: "Kamu tipe sesi apa?" quiz with a 3D background, tilt and shake, and a shareable Story card
- `main.html`: six mini games, one per session type (`?g=personal|couple|keluarga|wisuda|brand|kol`); the marquee links to them
- `js/mini.js`, `js/games/`: the shared 2D game engine and one file per game
- `js/icons.js`: game-icons.net icons (CC BY 3.0) used by the marquee and the games
- `js/fx.js`: shared three.js scene (floating polaroids) plus phone helpers (tilt, shake, vibration, share)
- `team.html`: team page; edit the `TEAM` list at the bottom of the file
- `preview.html`: interactive iPhone and Android preview
- `previews/`: static phone screenshots

## Phone vs. computer

`js/tabs.js` decides by device type: touch devices and the installed app get the app layout (bottom tab bar: Beranda, Lokasi, Main, Jurnal, Info; one tab visible at a time; back button switches tabs). Mouse devices always get the one-page website. Sections opt in with `data-tab="..."`.

## Editing

- **Exact map pins:** in `index.html`, find `PLACES` and replace each name with `"lat,lng"`.
- **Team photos:** put them in `img/team/` and set `photo: 'img/team/name.jpg'`.
- **Installable app:** `manifest.webmanifest` and `icons/` make it installable on iOS and Android.
