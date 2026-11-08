# Sumiro

### ▶ [Play Sumiro in your browser — sumirro.vercel.app](https://sumirro.vercel.app/)

**Sumiro** is a browser-based 3D action-platforming experience with an ink-and-paper visual style. The game is shipped here as a self-contained static web build: open its entry page through a local web server or deploy the included game directory to any static host.

## Contents

- [Play locally](#play-locally)
- [Controls](#controls)
- [Project layout](#project-layout)
- [Deployment](#deployment)
- [Technical notes](#technical-notes)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Play locally

This repository does not need Node.js, a package manager, or a build step to run. It contains the already-built game files.

1. Clone the repository:

   ```bash
   git clone https://github.com/1anc6/sumiro.git
   cd sumiro
   ```

2. Start a local HTTP server from the game directory:

   ```bash
   cd sumiro/sumiro
   python -m http.server 8080
   ```

3. Open [http://localhost:8080](http://localhost:8080) in a modern desktop browser.

Do not open `index.html` directly with a `file://` URL. The game loads models, textures, JSON data, JavaScript modules, and WebAssembly decoder files; browsers commonly block those requests when a page is opened directly from disk.

## Controls

Click inside the game to give it focus and enable mouse look.

| Action | Keyboard / mouse |
| --- | --- |
| Move | `WASD` or arrow keys |
| Look | Mouse |
| Jump / confirm | `Space` |
| Sprint | `Shift` |
| Dodge / ink step | `Q` or `Alt` |
| Attack | Left mouse button or `J` |
| Parry | Right mouse button or `K` |
| Interact | `E` |
| Drink / use | `F` |
| Pause / back | `Esc` or `P` |

The input layer also recognizes a connected gamepad.

### Touch (phones and tablets)

On touch-first devices, `touch.js` adds on-screen controls. The game plays in landscape only; in portrait it asks you to turn the phone (and pauses if you turn it mid-game). Step appears once the ink step is earned, and Strike and Parry once the sword is found in Chapter Four.

| Action | Touch |
| --- | --- |
| Move | Left thumb anywhere on the left side (push fully to sprint) |
| Look | Drag with the right thumb |
| Jump / Strike / Step / Parry / Use | Buttons at the bottom right |
| Pause | `II` button at the top right |
| Menus | Tap the menu items |

Touch devices also render at a slightly lower resolution to keep the frame rate up.

## Project layout

```text
sumiro/
├── .nojekyll                 # Keeps static hosts from processing the build with Jekyll
└── sumiro/                   # Game web root — deploy or serve this directory
    ├── index.html             # Game entry page
    ├── touch.js               # On-screen touch controls (loaded on phones and tablets only)
    ├── bundle/                # JavaScript modules and WebAssembly decoder assets
    └── assets/                # 3D models, textures, level data, and UI artwork
```

The nested `sumiro/sumiro` directory is intentional: the outer directory is the project’s exported site container, while the inner directory holds the playable web application. The main page is [`sumiro/sumiro/index.html`](sumiro/sumiro/index.html).

### Assets

The `assets/` folder includes the game data loaded at runtime:

- `levels/` — six authored locations: climb, pass, pines, temple, sea, and summit.
- `player/` — the player model and clothing data.
- `env_*` — reusable environment models such as cliffs, pines, plateaus, gates, and bridge stairs.
- `fx_*` — ink, mist, and crow visual-effect assets.
- `backdrop/` and `ui/` — scenic layers, textures, and interface artwork.

The `bundle/` folder contains the compiled game engine, camera, player, collision, combat, HUD, rendering, audio, chapter, and effect modules. The file names contain content hashes, so they should not be renamed independently of `index.html` and the other modules that reference them.

## Deployment

The live build is hosted on Vercel at **https://sumirro.vercel.app/**.

Deploy the contents of `sumiro/sumiro` as a static site. No server-side runtime or environment variables are required.

### GitHub Pages

GitHub Pages must publish the directory containing `index.html`. Because the entry file is nested, use a GitHub Actions deployment workflow (or another static-host deployment configuration) that publishes `sumiro/sumiro` as its artifact directory.

If you simply browse the repository through GitHub, the game entry page is at `sumiro/sumiro/index.html`; GitHub’s file viewer is not the game host. A Pages deployment or a static host is still required to play it in a browser.

### Other static hosts

Services such as Netlify, Vercel static hosting, Cloudflare Pages, or an ordinary web server can host the build. Set the publish/output directory to:

```text
sumiro/sumiro
```

Keep the original directory structure intact. The JavaScript modules request assets by relative paths.

## Technical notes

- The project is a static, compiled web build rather than the editable source project.
- It uses browser graphics APIs and requires WebGL support; a recent Chrome, Edge, Firefox, or Safari release is recommended.
- The game uses ES modules, glTF/GLB models, image textures, JSON configuration files, and Draco decoder WebAssembly files.
- A mouse is recommended because the game uses pointer lock for camera control after the canvas is clicked.
- Performance depends on GPU capability, browser settings, display resolution, and available system memory.

## Troubleshooting

### Blank page, missing models, or network errors

Run the project through a local server rather than opening the HTML file directly. Start the server from `sumiro/sumiro` and revisit `http://localhost:8080`.

### The camera does not move

Click the game canvas once. This allows the browser to grant pointer lock, which the mouse-look camera uses. Press `Esc` to release pointer lock.

### The game is slow or does not render

Use an up-to-date desktop browser with hardware acceleration enabled. Check the browser’s graphics/WebGL settings, close GPU-heavy applications, and try lowering the display resolution or browser zoom.

### A static-host deployment shows 404s for assets

Confirm that the host publishes the contents of `sumiro/sumiro`, not just the repository root. Do not change the names or relative positions of `bundle/` and `assets/`.

## Contributing

This repository currently contains the production build. For safe documentation or hosting changes:

1. Keep all paths under `sumiro/sumiro` unchanged unless every affected asset reference is updated.
2. Test using a local HTTP server before pushing.
3. Avoid manually editing hashed files in `bundle/`; changes to game behavior are best made from the original source project and rebuilt.

## License

No license has been added to this repository yet. If you plan to accept outside contributions or allow reuse, add a `LICENSE` file that states the intended terms.
