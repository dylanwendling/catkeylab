# 🐾🔑 CatKeyLab

<h3 align="center">Free, Private & Powerful Online Hardware Testing Suite, Human Benchmarks & Typing Challenge</h3>
<h4 align="center">🌐 <a href="https://catkeylab.com/">https://catkeylab.com</a></h4>

<p align="center">
  <a href="https://catkeylab.com/"><img src="https://img.shields.io/badge/Website-catkeylab.com-orange.svg?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Website"></a>
  <a href="#key-features--included-tools"><img src="https://img.shields.io/badge/Tools-15_Interactive_Modules-emerald.svg?style=for-the-badge" alt="15 Tools"></a>
  <a href="#nibbles-the-cat--interactive-toys"><img src="https://img.shields.io/badge/Companion-Nibbles_the_Cat_🐱-orange.svg?style=for-the-badge" alt="Nibbles the Cat"></a>
  <a href="#internationalization-i18n"><img src="https://img.shields.io/badge/Languages-13_Supported-purple.svg?style=for-the-badge" alt="13 Languages"></a>
  <a href="#technology-stack--architecture"><img src="https://img.shields.io/badge/Dependencies-Zero_External-brightgreen.svg?style=for-the-badge" alt="Zero Dependencies"></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License"></a>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [🏆 Anonymous Global Leaderboards](#-anonymous-global-leaderboards)
- [🐱 Nibbles the Cat & Interactive Toys](#-nibbles-the-cat--interactive-toys)
- [✨ Key Features & Included Tools](#-key-features--included-tools)
- [🛠️ Technology Stack & Architecture](#️-technology-stack--architecture)
- [📁 Project Directory Structure](#-project-directory-structure)
- [🚀 Getting Started](#-getting-started)
- [🌐 Internationalization (i18n)](#-internationalization-i18n)
- [📄 License](#-license)

---

## 📖 Overview

**CatKeyLab** ([catkeylab.com](https://catkeylab.com/)) is a lightweight, high-performance web application created by **Dylan** ([snowyorca.itch.io](https://snowyorca.itch.io/)) built for testing mouse hardware, keyboard switches, WPM typing speed, cognitive Human Benchmarks, and reaction latency directly inside your web browser.

<p align="center">
  <img src="./assets/orange-cat.jpg" width="340" alt="Real Orange Cat in Box - Inspiration for Nibbles" style="border-radius:12px; border:3px solid #f97316;" /><br>
  <em>Meet the adorable real-life orange cat sitting in a box who inspired Nibbles! 🐱</em>
</p>

---

## 🏆 Anonymous Global Leaderboards (Firebase Realtime Database & SSE)

CatKeyLab features a 100% private, anonymous global leaderboard system powered by **Firebase Realtime Database & EventSource SSE Live Streaming**:

- **Real-Time Live Streaming (< 50ms)**: Built with native browser `EventSource` (Server-Sent Events) and Google Cloud REST endpoints (`catkeylab-default-rtdb.firebaseio.com`). High scores stream live to all connected devices worldwide in under 50 milliseconds!
- **Zero Account & No Login**: Automatically assigns a fun anonymous cat alias (e.g. `Speedy Tabby #4820`, `Laser Whiskers #8912`) and cat emoji avatar.
- **Percentile Ratings**: Calculates real-time rank percentiles (*e.g., "Top 1% (Leaderboard #1 Leader! 🥇)"*) upon test completion.
- **Direct Result Nav**: Completing any benchmark game displays a direct **`🏆 View Global Leaderboard`** button opening the exact game tab played with your **`YOU`** highlight pill.
- **Interactive Controls**: Click **`🎲 Randomize Name & Emoji`**, **`🎭 Cycle Emoji`**, or **`🔄 Refresh Live Scores`** anytime.

---

## 🐱 Nibbles the Cat & Interactive Toys

CatKeyLab features **Nibbles**, a playful Ginger Tabby Cat wearing a ruby red collar with a shiny gold bell 🔔 who accompanies you while you test hardware!

### 🐾 1. Pupil Tracking & Paw Reactions (`catMascot.js`)
- **Smooth Cursor Tracking**: Nibbles' pupils follow your cursor in real time across the viewport.
- **Paw Swatting**: Paws reach out toward your mouse cursor as you move nearby.
- **WPM Judging**: Nibbles evaluates your typing speed, purring happily for fast typists or squinting judgmentally at typos!
- **Click Petting**: Click Nibbles directly to pet him, triggering purrs and floating heart/paw particles (`❤️`, `🐾`).

### 🧶 2. Throwable Yarn Ball Toy (`yarnBall.js`)
- **Physics Drag & Throw**: Drag and flick the Yarn Ball 🧶 across your screen with momentum friction damping (`0.94`) and screen boundary bounce physics!

### 🥣 3. Cat Food Bowl & Fish Feeding (`foodBowl.js`)
- **Interactive Food Bowl**: Click or drag the Cat Food Bowl 🥣 in the bottom-right corner to spawn fresh, draggable **Fish 🐟** to feed Nibbles.

---

## ✨ Key Features & Included Tools

CatKeyLab includes fifteen specialized interactive modules accessible via client-side hash routing:

### 🧠 Human Benchmark & Cognitive Suite
1. **⏱️ Reaction Time Test (`#reaction-time-test`)**: Tests visual reaction latency in milliseconds.
2. **🧠 Sequence Memory Test (`#sequence-memory-test`)**: Simon-says 3x3 interactive pattern recall with Web Audio API sound frequencies.
3. **🎯 Aim Trainer (`#aim-trainer-test`)**: 30 targets precision challenge measuring target acquisition speed and aim accuracy.
4. **🔢 Number Memory Test (`#number-memory-test`)**: Digit span recall test with animated countdown timer bars.
5. **💬 Verbal Memory Test (`#verbal-memory-test`)**: Sequential word memory test identifying words as **SEEN** or **NEW** with 3 lives.
6. **🐒 Chimp Test (`#chimp-test`)**: Working memory grid test clicking numbers 1..N in order before tiles hide.
7. **🔳 Visual Memory Test (`#visual-memory-test`)**: Spatial matrix pattern recall expanding from 3x3 to 7x7 grid.
8. **⌨️ Typing Speed Challenge (`#typing-test`)**: Distraction-free Monkeytype-inspired WPM speed test with Nibbles judging.

### 🖱️ Hardware & Speed Diagnostics
9. **🖱️ Mouse Hardware Tester (`#mouse-test`)**: Tests Left, Right, Middle, Side (MB4/MB5), and scroll wheel direction.
10. **🖥️ Visual Keyboard Tester (`#keyboard-test`)**: Visual keyboard layout, NKRO rollover test, and DOM KeyCode inspector.
11. **🎯 Online Auto Clicker (`#auto-clicker`)**: In-browser automated clicking simulator with interval controls.
12. **⚡ CPS Test (`#cps-test`)**: Timed clicks-per-second speed benchmarking.
13. **🚀 Click Speed Test (`#click-speed-test`)**: Real-time velocity analytics and click consistency gauges.
14. **🔢 Digital Click Counter (`#click-counter`)**: Tactile tally counter with spacebar triggers.
15. **👆 Double Click Chatter Test (`#double-click-test`)**: Hardware chatter detector for faulty mouse micro-switches.

---

## 🛠️ Technology Stack & Architecture

- **Markup**: Semantic HTML5 with ARIA accessibility tags.
- **Styling**: Vanilla CSS3 with CSS Custom Properties, dark-mode glassmorphism, and responsive CSS grids.
- **Logic**: Modular ES2022+ JavaScript with functional route cleanup.
- **Audio Engine**: Native **Web Audio API** synthesized sound effects.
- **Leaderboards Engine**: Client-side anonymous identity generator & leaderboard engine (`leaderboard.js`).

---

## 📁 Project Directory Structure

```
catkeylab/
├── index.html                  # Main HTML document & SPA layout shell
├── README.md                   # Project documentation
├── render.yaml                 # Render Blueprint specification
├── css/
│   ├── main.css                # Color tokens, cat theme background, reset & utilities
│   ├── components.css          # UI component styles (buttons, cards, leaderboard, FAQ)
│   └── mascot.css              # Nibbles vector styling, yarn ball & food bowl rules
├── js/
│   ├── app.js                  # Application entry point & subsystem initialization
│   ├── router.js               # Hash routing engine, tool metadata registry & SEO sync
│   ├── leaderboard.js          # Anonymous identity engine & leaderboard rank calculator
│   ├── i18n.js                 # Translation dictionary (13 languages)
│   ├── theme.js                # Theme switcher (Dark / Light mode)
│   ├── audio.js                # Synthesized Web Audio API sound generator
│   ├── components/
│   │   ├── catMascot.js        # Nibbles the Cat pupil tracking & speech engine
│   │   ├── yarnBall.js         # Interactive Throwable Yarn Ball 🧶 physics component
│   │   ├── foodBowl.js         # Cat Food Bowl 🥣 & Fish Feeding 🐟 component
│   │   ├── leaderboardView.js  # Global Anonymous Leaderboards UI component
│   │   ├── header.js           # Navigation header component
│   │   └── footer.js           # Footer component
│   └── tools/
│       ├── sequenceMemoryTest.js # Sequence Memory (Simon grid) module
│       ├── aimTrainerTest.js     # Aim Trainer 30 targets module
│       ├── numberMemoryTest.js   # Number Memory digit span module
│       ├── verbalMemoryTest.js   # Verbal Memory SEEN/NEW word module
│       ├── chimpTest.js          # Chimp Test memory grid module
│       ├── visualMemoryTest.js   # Visual Memory matrix module
│       ├── typingTest.js         # Typing Speed Challenge (WPM) module
│       ├── reactionTimeTest.js   # Visual reaction timer module
│       ├── cpsTest.js            # CPS Benchmark & ranking system
│       ├── autoClicker.js        # Auto Clicker simulation engine
│       ├── clickSpeedTest.js     # Click velocity analytics
│       ├── clickCounter.js       # Digital tally counter
│       ├── mouseTest.js          # Mouse button & scroll wheel tester
│       ├── keyboardTest.js       # Visual keyboard keypress tester
│       └── doubleClickTest.js    # Hardware chatter detector
```

---

## 🚀 Getting Started

Because CatKeyLab relies entirely on standard ES Modules and native web APIs, **no build step, transpilation, or heavy npm installation is required**.

### Quick Start (Local Server)

Serve the project locally using any static web server from the project root directory:

#### Option 1: Node.js (`npx serve`)
```bash
npx serve .
```

#### Option 2: Python (Built-in HTTP Server)
```bash
# Python 3.x
python -m http.server 8000
```

#### Option 3: VS Code Live Server Extension
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

Open your browser and navigate to:
```
http://localhost:8000
```

---

## 🌐 Internationalization (i18n)

CatKeyLab features native multi-language support for 13 global languages out of the box:

| Language | Code | Language | Code |
| :--- | :--- | :--- | :--- |
| **English** | `en` | **Dutch** | `nl` |
| **Spanish** | `es` | **Polish** | `pl` |
| **French** | `fr` | **Turkish** | `tr` |
| **German** | `de` | **Russian** | `ru` |
| **Portuguese** | `pt` | **Japanese** | `ja` |
| **Italian** | `it` | **Korean** / **Chinese** | `ko` / `zh` |

Language selection can be toggled via the header navigation dropdown or by appending `?lang=<code>` to the URL (e.g. `https://catkeylab.com/?lang=es#typing-test`).

---

## 🎨 Design System & Ambient Cat Theme

CatKeyLab features a curated cat-themed design system driven by CSS Custom Properties (`:root` tokens):

- **Color Tokens**: Catnip Emerald (`#10b981`), Ginger Tabby Orange (`#f97316`), Soft Salmon Pink (`#fda4af`), and Dark Slate Navy (`#0f172a`).
- **Cat Paw Watermark Pattern**: Handcrafted SVG cat paw watermark background grid layer floating across the page backdrop.
- **Dark & Light Modes**: Automatically respects system OS settings (`prefers-color-scheme`) and persists user preference in `localStorage`.
- **Responsive Layout**: Designed mobile-first, ensuring smooth operation across mobile phones, tablets, laptops, and desktop displays.

---

## 🔊 Web Audio API Synthesizer & Sound

To maintain 100% offline capability and zero network overhead, CatKeyLab programmatically synthesizes audio in real-time:

- **Pure Oscillators**: Uses `AudioContext` with sine/square wave oscillators and exponential gain ramps.
- **Sound Effects**: Synthesizes mechanical typing key clicks, UI button clicks, score achievement chimes, and soft cat purr sounds.
- **Mute Control**: Sound setting stored in browser preferences (`catkeylab_sound`).

---

## 🔍 SEO & Metadata Coordinator

Each tool page automatically updates DOM metadata upon client navigation:

- Dynamic Page Title & Meta Description update (`document.title`, `meta[name="description"]`).
- Canonical URL generation (`catkeylab.com`) and Open Graph (`og:title`, `og:description`, `og:url`) synchronization.
- Multi-language `hreflang` alternate link tags injected into document `<head>`.
- Built-in dynamic FAQ schemas rendered for search engine indexing.

---

## 🤝 Contributing

Contributions to CatKeyLab are welcome! Whether you are adding a new testing tool, improving translation coverage, or refining Nibbles' animations:

1. **Fork the Repository**
2. **Create a Feature Branch** (`git checkout -b feature/awesome-tool`)
3. **Commit Your Changes** (`git commit -m 'Add fantastic new feature'`)
4. **Push to the Branch** (`git push origin feature/awesome-tool`)
5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute CatKeyLab for personal or commercial projects.

<p align="center">
  Made with ❤️ for gamers, typists, and hardware enthusiasts worldwide. 🐾
</p>
