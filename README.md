# Year Progress

A simple, modern web app that visually displays how much of the current year has passed, updated in real time. The project also includes a backend (Node.js/Express) for scheduled social media updates, but the main focus is the static web UI.

## Features
- Animated progress bar showing the percentage of the year completed
- Displays the current date and day of the year
- Responsive, modern UI
- Deployable as a static site (GitHub Pages)

## Live Demo
[View on GitHub Pages](https://pappater.github.io/yearprogress/)

## Usage
Just open the [live demo](https://pappater.github.io/yearprogress/) in your browser. The progress bar and stats update automatically.

## Local Development
1. Clone the repo:
   ```bash
   git clone https://github.com/pappater/yearprogress.git
   cd yearprogress
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Open `index.html` in your browser to view the UI.

## Deployment
To deploy to GitHub Pages:
```bash
npm run deploy
```
This will publish the contents of the `dist/` folder to the `gh-pages` branch.

## Project Structure
- `index.html` / `style.css` / `ui.js`: Static web UI
- `index.js`: Node.js backend (optional, for scheduled tweets)
- `dist/`: Static files for deployment

## Screenshots
![Year Progress Screenshot](https://raw.githubusercontent.com/pappater/yearprogress/gh-pages/screenshot.png)

---

© 2025 pratheesh. MIT License.
