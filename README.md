# tampermonkey-x-post-mode

A Tampermonkey userscript that simplifies the X (Twitter) UI into a **post-only view**, hiding everything except the compose area.

Toggle between Post Mode and the original page with a fixed button in the bottom-left corner.

## Features

- **`/home`** — Hides the left sidebar, right sidebar, and timeline feed. Only the compose area remains, centered and framed
- **`/{profile}`** — Hides the left sidebar, right sidebar, tab navigation, and tweet list. Injects a **Post** button into the center column
- **Toggle button** — Fixed at the bottom-left. Blue pen icon = Post Mode, gray list icon = Original Mode (Full View)
- **Persistent state** — Mode is saved across sessions via `GM_setValue`
- **SPA-aware** — Reacts to X's client-side navigation via `MutationObserver`

## Screenshots

### PC

#### x.com/home

| Post Mode | Original Mode |
|---|---|
| ![](./readme/desktop-home-post-mode.png) | ![](./readme/desktop-home-original-mode.png) |

#### x.com/{profile}

| Post Mode | Original Mode |
|---|---|
| ![](./readme/desktop-profile-post-mode.png) | ![](./readme/desktop-profile-original-mode.png) |

#### x.com/compose/post

| Post Mode | Original Mode |
|---|---|
| ![](./readme/desktop-compose-post-post-mode.png) | ![](./readme/desktop-compose-post-original-mode.png) |

### Smartphone

<!-- NOTE: Emulated iPhone 12 Pro (390x844) in Chrome DevTools -->

#### x.com/home

TODO

#### x.com/{profile}

| Post Mode | Original Mode |
|---|---|
| <img src="./readme/smartphone-profile-post-mode.png" width="400" /> | <img src="./readme/smartphone-profile-original-mode.png" width="400" /> |

#### x.com/compose/post

TODO

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser
2. Click [this link](https://github.com/aiya000/tampermonkey-x-twitter-post-mode/raw/refs/heads/main/x-post-mode.user.js),  
   or open [`x-post-mode.user.js`](./x-post-mode.user.js) and click **Raw**
3. Tampermonkey will prompt you to install the script — click **Install**

## Usage

| Action | Result |
|---|---|
| Visit `x.com/home` (or `twitter.com/home`) with Post Mode ON | Compose area only |
| Visit `x.com/{profile}` (or `twitter.com/{profile}`) with Post Mode ON | Profile info + Post button |
| Click the **blue pen button** (bottom-left) | Switch to Original Mode (Full View) |
| Click the **gray list button** (bottom-left) | Switch back to Post Mode |
