# Michiko Portfolio

Static portfolio website built with HTML, CSS, and vanilla JavaScript. It can be deployed to GitHub Pages.

## Project structure

- `index.html` — page structure and content
- `css/main.css` — design tokens, base layout, and typography
- `css/components.css` — navigation, cards, interactions, and responsive styles
- `js/data.js` — portfolio data (projects, experience, achievements, interests)
- `js/app.js` — UI behaviour and dynamic rendering
- `assets/` — local images and files

## Before publishing

1. Add your own `assets/profile.png` image.
2. Add your CV as `assets/Michiko-Natha-CV.pdf`. The **Download CV** button downloads this file. If you use a different filename or URL, update `CFG.resume` in `js/data.js`.
3. Update project links in `js/data.js` (`link: "#"` items currently point back to the Projects section because no external URL was supplied).
4. The contact form validates the fields and prepares an email draft using `mailto:`. It does not store or send details to a server. The visitor must send the email from their own email app. For a fully hosted form, connect a form service or backend.
5. Preview by opening `index.html` or running a local static server.

## Deploy to GitHub Pages

Push the project to a GitHub repository. Open **Settings → Pages**, choose **Deploy from a branch**, select the branch and `/ (root)`, then save. All paths in this project are relative so it can work from a GitHub Pages project subpath.
