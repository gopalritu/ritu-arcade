# Mini Arcade — Browser Games

A browser-playable adaptation of the supplied Flappy Bird and Car Dodging C++/SFML games.

## Run locally

You can open `index.html` directly in a browser. For a local web server (recommended), run:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Deploy to Vercel

1. Push the contents of this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Select **Other** as the framework preset (or leave the static-site preset).
4. Leave Build Command empty and set Output Directory to `.` if prompted.
5. Deploy.

The site is static: no build step or server-side runtime is required.

## Controls

- Flappy Bird: Space or tap to flap; P to pause; R to restart after game over.
- Car Dodging: Left/Right arrows or A/D; on mobile use the on-screen arrows or swipe; R to restart after game over.

Best scores are stored in the browser's local storage on that device/browser.
