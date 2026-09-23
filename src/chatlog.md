# MP1 Chatlog — LLM-Assisted Development

**Course:** CS 409
**Assignment:** MP1 — Single-Page Website
**Tool used:** Claude (Anthropic)

This document summarizes the key parts of my conversation with an LLM while
building MP1, with a focus on the difficulties I ran into and how they were
resolved. The full working site (HTML, SCSS, JS) was developed iteratively
through this conversation.

---

## 1. Choosing the topic and building the initial site

I started by asking the LLM to build a single-page website that satisfies all
16 MP1 requirements. The first version was a fictional creative studio. I
decided I wanted a personal portfolio instead, so I asked it to redo everything
as a personal page. I then uploaded my resume so the content could be
customized with my real background (FedEx internship, TCS experience, UIUC
master's, and my projects like the flight tracker and MedVision).

The site was structured into full-width sections: hero, about (3-column),
projects (carousel), approach (fixed background), experience (modals), video,
and footer.

---

## 2. Difficulty: two style files (style.css vs style.scss)

**Problem:** The LLM initially gave me both a `.scss` source file and a
compiled `.css` file, and I was confused about which one to use since my course
build setup expects a single `main.scss` under the `css/` folder.

**Resolution:** We consolidated everything into a single `css/main.scss`, since
the course's webpack build compiles the SCSS automatically. The separate
compiled CSS was removed.

---

## 3. Difficulty: webpack "Module not found" errors

**Problem:** After running `npm start`, webpack threw errors:

```
Module not found: Error: Can't resolve './css/main.css'
Module not found: Error: Can't resolve './js/script.js'
```

**Cause:** The HTML still had `<link>` and `<script>` tags pointing at files
directly, but this webpack setup bundles CSS and JS through the entry point
(`index.js`), so those tags made html-loader try to resolve them as modules.

**Resolution:**
- Removed the `<link>` and `<script>` tags from `index.html`.
- Renamed `script.js` to `main.js` to match what the entry point imports.

---

## 4. Difficulty: CSS not applying at all (biggest issue)

**Problem:** The build compiled with zero errors and reported 37.6 KiB of CSS,
but the page rendered as plain unstyled black text on white. The navbar,
colors, and layout were all missing.

**Debugging steps we went through:**
- First suspected the external `@import url()` for Google Fonts and FontAwesome
  in the SCSS was breaking css-loader, so we moved font loading into JavaScript
  instead.
- Added a `body { background: red !important; }` test to check whether *any*
  CSS was reaching the browser. It didn't turn red, which proved the entire CSS
  pipeline was broken, not just my styles.
- Checked the browser console and found a 404, plus a missing script tag.
- Ran `curl http://localhost:8080/` to see the actual served HTML.

**Root cause found:** The served HTML had **no `<script src="bundle.js">` tag**
at the end. Without the bundle running, style-loader never injected the CSS and
the JavaScript never executed.

The reason injection failed: my `src/index.html` had a large **commented-out
boilerplate block** at the top (the old "Hello World" template) that contained a
fake `</body>` inside the comment. HtmlWebpackPlugin got confused by the
duplicate `</body>` and silently skipped injecting the bundle script.

**Resolution:**
- Removed `import './index.html'` from `index.js` (HtmlWebpackPlugin already
  handles the HTML via its `template` option).
- Deleted the commented-out boilerplate block at the top of `index.html`.

After this, the CSS loaded correctly and the whole site rendered as intended.

---

## 5. Difficulty: fixed background image barely visible

**Problem:** The "How I think about engineering" section used a fixed background
image, but the dark overlay was at 85% opacity, so the image was almost
invisible.

**Resolution:** Lowered the overlay opacity from `0.85` to `0.55`, bumped up the
paragraph text opacity for readability, and added a subtle text-shadow so the
white text stayed legible over the brighter image.

---

## 6. Difficulty: video would not play

**Problem:** The embedded HTML5 video showed the player and poster image, but
clicking play did nothing. The console showed a 403 / AccessDenied error.

**Debugging:** We tried several public sample video URLs (Google's
`gtv-videos-bucket`, w3schools, MDN). The Google bucket returned an
`AccessDenied` XML error because it had become access-restricted. Public stock
sites like Pixabay and Pexels serve videos behind tokenized CDN URLs that
expire, so they couldn't be hardcoded reliably.

**Resolution:** Downloaded a royalty-free coding video from Pixabay, placed it
in `src/assets/`, and pointed the `<video>` source at the local file
(`assets/163491-827845629_large.mp4`). Since the webpack config already copies
the `assets/` folder into the build, the local video plays reliably and is
relevant to my field (software engineering).

---

## 7. Deployment to GitHub Pages

**Problem:** The GitHub Actions deploy step failed with:

```
Error: Creating Pages deployment failed
Error: HttpError: Not Found (status: 404)
```

**Cause:** GitHub Pages source was not set to "GitHub Actions."

**Resolution:** In repo Settings > Pages > Build and Deployment > Source,
selected "GitHub Actions," then re-ran the failed workflow. We also discussed
adding `publicPath: '/mp1/'` to the webpack `output` config in case assets
404'd in the `/mp1` subfolder after deployment.

---

## Summary of requirements covered

All 16 MP1 requirements were implemented: single-page layout with header and
footer, sticky navbar, scroll position indicator (with last-item edge case
handled on scroll to bottom), navbar resizing, smooth scrolling, a multi-slide
carousel with side arrows, a 3-column section, horizontal and vertical
centering, responsiveness across the five required resolutions, a fixed-position
background image, modal windows, an embedded HTML5 video, SCSS features
(variables, mixins, nesting), CSS3 animations (keyframe fade-in plus
transitions), scalable vector icons via FontAwesome, and social media icons in
the footer.

The most significant difficulty by far was the CSS not loading, which turned out
to be a webpack script-injection problem caused by leftover commented-out
boilerplate in the HTML, not a problem with the CSS itself.
