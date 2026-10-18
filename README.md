# 🎲 Kingdom Dice — Medieval Farkle

<p align="center">
  <img src="img/icon-512.png" alt="Kingdom Dice Icon" width="128" height="128" style="border-radius: 20px;">
</p>

<p align="center">
  <strong>A rustic, high-stakes medieval Farkle duel of luck &amp; wit.</strong><br>
  Play right in your browser, install on desktop (Windows), or take it on Android.
</p>

<p align="center">
  <a href="https://haarrywhiite.github.io/Farkle/"><img src="https://img.shields.io/badge/Play-GitHub_Pages-2ea44f?style=for-the-badge&logo=github" alt="Play Online"></a>
  <a href="https://github.com/haarrywhiite/Farkle/releases"><img src="https://img.shields.io/badge/Download-Windows_Installer-0078d4?style=for-the-badge&logo=windows" alt="Download Windows"></a>
  <img src="https://img.shields.io/badge/License-ISC-amber?style=for-the-badge" alt="License">
</p>

---

## ⚔️ Overview

**Kingdom Dice** brings the classic dice game of Farkle into a rich tavern setting complete with parchment UI, wooden tavern textures, smooth dice rolling physics, and dynamic AI opponents.

### 🌟 Highlights

- **Multiple Game Modes**:
  - 👑 **Versus King**: Challenge AI opponents across Apprentice, Knight, and King difficulties.
  - 👥 **Local Duel**: Pass-and-play with a friend on the same screen.
  - 🏆 **Tournament**: Climb through bracketed tavern tournament rounds.
- **Cross-Platform**:
  - 🌐 **Web**: Instant gameplay hosted on [GitHub Pages](https://haarrywhiite.github.io/Farkle/).
  - 🖥️ **Windows Desktop**: Native Electron app with auto-updater support and custom installer.
  - 📱 **Android**: Powered by Capacitor.
- **Authentic Medieval Aesthetics**: Custom typography, tavern backgrounds, leather mats, and parchment scoring cards.
- **Multilingual Support**: Fully localized with dynamic in-game language switching.

---

## 📜 How to Play (Farkle Rules)

1. **Roll the Dice**: Roll 6 dice onto the tavern table.
2. **Bank or Risk**: Select scoring dice combinations (ones, fives, triples, runs, etc.).
3. **Keep Rolling**: Roll the remaining dice to push your round score higher.
4. **Beware the Farkle!**: If a roll contains no scoring dice, you Farkle and lose all unbanked points from that turn!
5. **Hot Dice**: Score with all 6 dice and earn a fresh set of 6 to keep building your streak.
6. **Victory**: First player to reach the target score (typically 5,000 or 10,000 points) and survive the final round wins!

---

## 🛠️ Project Structure

```text
├── .github/
│   └── workflows/
│       └── release.yml     # Automated desktop release builder & publisher
├── app/                    # Web application assets and shared logic
├── css/                    # Modular stylesheets (bracket, buttons, styles)
├── electron/               # Desktop wrapper (main process & auto-updates)
├── img/                    # Artwork, tavern backgrounds, dice & icons
├── js/                     # Game engine (AI, scoring, dice physics, UI)
├── android/                # Android Capacitor project
├── index.html              # Main game entry point
├── build.js                # Build script for packaging to www/
├── capacitor.config.json   # Mobile app configuration
└── package.json            # Scripts & project dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or v22 recommended)
- `npm`

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/haarrywhiite/Farkle.git
cd Farkle
npm install
```

### Running Locally

To launch the local development web server:

```bash
npm start
# or
npm run dev
```

To run the desktop version in development:

```bash
npm run desktop:start
```

---

## 📦 Building Releases

- **Web Build**:
  ```bash
  npm run build
  ```
  Copies all web assets into `www/`.

- **Windows Desktop Installer**:
  ```bash
  npm run desktop:build
  ```
  Generates the Windows installer `.exe` inside `release/`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/haarrywhiite/Farkle/issues).

---

## 🎵 Music

Tavern soundtrack tracks are from [FreePD.com](https://freepd.com) — all **CC0 public domain**, so **no attribution or license credit is required**. Music plays locally from `audio/` (works fully offline).

- *Bar Brawl* — Bryan Teoh — `audio/bar-brawl.mp3`
- *Village Tarantella* — Kevin MacLeod — `audio/village-tarantella.mp3`
- *Still Pickin'* — Kevin MacLeod — `audio/still-pickin.mp3`

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
