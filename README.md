# ⚡ ClickPulse

<h3 align="center">Free, Private & Powerful Online Browser Clicking & Hardware Testing Suite</h3>

<p align="center">
  <a href="#key-features"><img src="https://img.shields.io/badge/Tools-8_Interactive_Modules-blue.svg?style=for-the-badge" alt="8 Tools"></a>
  <a href="#internationalization-i18n"><img src="https://img.shields.io/badge/Languages-13_Supported-purple.svg?style=for-the-badge" alt="13 Languages"></a>
  <a href="#technology-stack"><img src="https://img.shields.io/badge/Dependencies-Zero_External-brightgreen.svg?style=for-the-badge" alt="Zero Dependencies"></a>
  <a href="#technology-stack"><img src="https://img.shields.io/badge/Audio-Web_Audio_API_Synthesizer-orange.svg?style=for-the-badge" alt="Web Audio API"></a>
  <a href="#getting-started"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License"></a>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [✨ Key Features & Included Tools](#-key-features--included-tools)
- [🛠️ Technology Stack & Architecture](#️-technology-stack--architecture)
- [📁 Project Directory Structure](#-project-directory-structure)
- [🚀 Getting Started](#-getting-started)
- [🌐 Internationalization (i18n)](#-internationalization-i18n)
- [🎨 Design System & Theme Engine](#-design-system--theme-engine)
- [🔊 Web Audio Synthesizer & Haptics](#-web-audio-synthesizer--haptics)
- [🔍 SEO & Metadata Coordinator](#-seo--metadata-coordinator)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 📖 Overview

**ClickPulse** is a lightweight, high-performance, single-page web application (SPA) built for testing and measuring mouse clicks, keyboard responsiveness, click velocity, reaction time, and peripheral hardware functionality directly in your web browser. 

Unlike traditional software tools, ClickPulse runs **100% inside your browser sandbox**, requiring **zero downloads, zero installations, zero plugins, and zero account sign-ups**. All testing metrics, personal best records, and configuration settings are processed locally on your client device to guarantee absolute privacy and instantaneous responsiveness.

---

## ✨ Key Features & Included Tools

ClickPulse includes eight specialized, feature-rich interactive modules accessible via client-side hash routing:

### 🎯 1. Auto Clicker (`#auto-clicker`)
- **Browser-Native Click Simulator**: Simulates continuous automated clicking directly within the page canvas.
- **Customizable Intervals**: Set click intervals in milliseconds or seconds.
- **Target Limit Controls**: Specify a fixed number of target clicks or run infinitely until stopped.
- **Click Types**: Supports Single Click, Double Click, and Right Click mode simulations.
- **Audio & Visual Metrics**: Real-time CPS calculation, interval countdowns, and synthesized sound effects.

### ⚡ 2. CPS Test (Clicks Per Second) (`#cps-test`)
- **Timed Speed Benchmarking**: Select from preset time intervals (1s, 5s, 10s, 30s, 60s).
- **Personal Best Tracking**: Automatically saves high scores and best CPS rates to `localStorage`.
- **Rank Progression Badges**: Gamified badge achievements (e.g., *Turtle*, *Rabbit*, *Cheetah*, *Lightning*, *Godlike*) based on CPS scores.
- **Interactive Visual Feedback**: Ripple click animations and synthesized sound feedback.

### 🚀 3. Click Speed Test (`#click-speed-test`)
- **Advanced Velocity Analytics**: Measures instant click frequency, peak CPS, burst velocity, and consistency metrics.
- **Real-Time Speed Gauge**: Live visual gauge displaying current click speed against historical averages.
- **Interval Breakdown**: Microsecond-precision timing logging consecutive click time deltas.

### 🔢 4. Digital Click Counter (`#click-counter`)
- **Tactile Digital Tally**: Increment, decrement, or reset tallies with customizable step sizes.
- **Keyboard Navigation**: Press **Spacebar** or **Enter** to increment counts effortlessly.
- **Goal Limit Alerts**: Set custom goal targets with audio and visual completion chimes.
- **Touch & Haptic Feedback**: Triggers native device vibration via the HTML5 Vibration API.

### 🖱️ 5. Mouse Hardware Tester (`#mouse-test`)
- **Multi-Button Verification**: Interactively tests Left Click (MB1), Right Click (MB2), Middle Click/Wheel (MB3), Side Button 4 (Back), and Side Button 5 (Forward).
- **Scroll Wheel Diagnostics**: Detects scroll direction (Up/Down) and measures scroll velocity.
- **Dynamic Visual Mouse Diagram**: Highlighted SVG diagram updating instantly as buttons are pressed.

### ⌨️ 6. Keyboard Tester (`#keyboard-test`)
- **Interactive Visual Keyboard Canvas**: Highlights pressed keys on a virtual layout in real-time.
- **DOM KeyCode Inspector**: Displays detailed DOM event properties (`key`, `code`, `keyCode`, `location`).
- **Modifier Key Tracking**: Monitors active state for Shift, Control, Alt, and Meta/Command keys.
- **Layout Agnostic**: Fully supports QWERTY, AZERTY, DVORAK, and custom international keyboard layouts.

### ⏱️ 7. Reaction Time Test (`#reaction-time-test`)
- **Visual Stimulus Benchmark**: Tests visual reaction latency in milliseconds.
- **False-Start Prevention**: Penalty detection for clicking before the indicator turns green.
- **Historical Averages**: Calculates average response times over multiple attempts with rating tiers.

### 🔍 8. Double Click Test (`#double-click-test`)
- **Hardware Chatter & Fault Detector**: Diagnoses worn mouse switches causing unintended double-clicks.
- **Threshold Analysis**: Measures millisecond gaps between consecutive clicks against a threshold (~80ms).
- **Warning Logs**: Flags potential switch chatter faults and displays full click latency logs.

---

## 🛠️ Technology Stack & Architecture

ClickPulse is built with modern, vanilla web standards to guarantee maximum efficiency, minimal bundle size, and long-term maintainability without reliance on heavy frameworks:

- **Markup**: HTML5 with semantic landmarks (`<main>`, `<header>`, `<footer>`, `<nav>`) and ARIA accessibility standards.
- **Styling**: Vanilla CSS3 utilizing CSS Custom Properties (variables), CSS Grid, Flexbox, glassmorphism UI overlays, and smooth CSS transitions.
- **Logic**: Modern JavaScript (ES2022+ / ES Modules) using modular components and functional cleanup handlers.
- **Audio Engine**: Native **Web Audio API** synthesized sound effects (Oscillators + GainNodes) eliminating external `.mp3`/`.wav` network calls.
- **Routing**: Lightweight hash-based client router (`js/router.js`) handling dynamic component loading, cleanup routines, and SEO metadata sync.
- **Localization**: Pure JS i18n engine (`js/i18n.js`) supporting 13+ languages with runtime dynamic translation switching.

---

## 📁 Project Directory Structure

```
clickpulse/
├── index.html                  # Main HTML document & SPA layout shell
├── README.md                   # Project documentation
├── css/
│   ├── main.css                # Design system tokens, reset, typography & layout styling
│   └── components.css          # UI component styles (buttons, cards, gauges, FAQ, header/footer)
├── js/
│   ├── app.js                  # Application entry point & core initialization workflow
│   ├── router.js               # Hash routing engine, tool metadata registry & SEO sync
│   ├── i18n.js                 # Translation dictionary (13 languages) & language manager
│   ├── theme.js                # Theme switcher (Dark / Light mode) with OS preference detection
│   ├── audio.js                # Synthesized Web Audio API sound generator & haptics controller
│   ├── components/
│   │   ├── header.js           # Site navigation bar, language picker & theme toggle button
│   │   ├── footer.js           # Dynamic footer with tool links, copyright & language select
│   │   ├── breadcrumbs.js      # Dynamic breadcrumb navigation bar
│   │   ├── faq.js              # Frequently Asked Questions accordion widget
│   │   └── adSpaces.js         # Non-intrusive banner layout containers
│   └── tools/
│       ├── autoClicker.js      # Auto Clicker simulation engine
│       ├── cpsTest.js          # CPS Benchmark & ranking system
│       ├── clickSpeedTest.js   # Velocity analytics & click speed gauge
│       ├── clickCounter.js     # Digital tally counter
│       ├── mouseTest.js        # Mouse button & scroll wheel hardware tester
│       ├── keyboardTest.js     # Visual keyboard keypress tester
│       ├── reactionTimeTest.js # Visual reaction timer module
│       └── doubleClickTest.js  # Hardware chatter & double-click fault detector
└── assets/                     # Static graphics, logos & icons
```

---

## 🚀 Getting Started

Because ClickPulse relies entirely on standard ES Modules and native web APIs, **no build step, transpilation, or npm package installation is required**.

### Quick Start (Local Server)

To serve the project locally, run any standard static web server from the project root directory:

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

After starting the server, open your browser and navigate to:
```
http://localhost:8000
```

---

## 🌐 Internationalization (i18n)

ClickPulse features native multi-language support for 13 global languages out of the box:

| Language | Code | Language | Code |
| :--- | :--- | :--- | :--- |
| **English** | `en` | **Dutch** | `nl` |
| **Spanish** | `es` | **Polish** | `pl` |
| **French** | `fr` | **Turkish** | `tr` |
| **German** | `de` | **Russian** | `ru` |
| **Portuguese** | `pt` | **Japanese** | `ja` |
| **Italian** | `it` | **Korean** / **Chinese** | `ko` / `zh` |

### How Translation Works
1. All translations are managed in [`js/i18n.js`](file:///c:/Users/thema/.gemini/antigravity-ide/scratch/clickpulse/js/i18n.js).
2. Language selection can be toggled via the header dropdown menu or by appending `?lang=<code>` to the URL (e.g. `https://clickpulse.app/?lang=es#cps-test`).
3. Switching languages dynamically re-renders page components without forcing a full page reload.

---

## 🎨 Design System & Theme Engine

ClickPulse features a modern design system driven by CSS Custom Properties (`:root` tokens):

- **Dark & Light Mode Support**: Automatically respects system OS settings (`prefers-color-scheme`) and persists user preference in `localStorage`.
- **Responsive Layout**: Designed mobile-first, ensuring smooth operation across smartphones, tablets, laptops, and desktop computers.
- **Glassmorphism & Micro-Animations**: Translucent backdrop blurs, active state scale transforms, and smooth color transitions.

---

## 🔊 Web Audio Synthesizer & Haptics

To maintain 100% offline capability and zero network overhead, ClickPulse generates audio programmatically:

- **Pure Oscillators**: Uses `AudioContext` with sine/square wave oscillators and exponential gain ramps.
- **Zero Asset Overhead**: No external MP3 audio files needed.
- **Mute Control**: Global toggle stored in browser preferences (`clickpulse_sound`).
- **Haptic Vibration**: Calls `navigator.vibrate()` on supported mobile browsers.

---

## 🔍 SEO & Metadata Coordinator

Each tool in ClickPulse automatically updates DOM metadata upon navigation:

- Dynamic Page Title & Meta Description update (`document.title`, `meta[name="description"]`).
- Canonical URL generation and Open Graph (`og:title`, `og:description`, `og:url`) synchronization.
- Multi-language `hreflang` alternate link tags injected into the document `<head>`.
- Built-in dynamic FAQ schemas rendered for structured search engine indexing.

---

## 🤝 Contributing

Contributions to ClickPulse are welcome! Whether you are adding a new testing tool, improving translation coverage, or optimizing UI performance:

1. **Fork the Repository**
2. **Create a Feature Branch** (`git checkout -b feature/amazing-tool`)
3. **Commit Your Changes** (`git commit -m 'Add fantastic new testing tool'`)
4. **Push to the Branch** (`git push origin feature/amazing-tool`)
5. **Open a Pull Request**

### Code Style Guidelines
- Maintain zero external runtime dependencies.
- Follow ES Module conventions (`export` / `import`).
- Always implement a `cleanupFn` in new tool modules to clean up event listeners and timers when switching routes.
- Ensure full keyboard accessibility (`aria-label`, key handler bindings).

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute ClickPulse for personal or commercial projects.

<p align="center">
  Made with ❤️ for gamers, developers, and hardware enthusiasts worldwide.
</p>
