<div align="center">

# 👻 Invisible

### *The messenger that's here, just like your privacy — you know it exists, but no one else does.*

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](LICENSE)
[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri-blue?logo=tauri)](https://tauri.app)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Backend-Rust-CE422B?logo=rust)](https://www.rust-lang.org)
[![Version](https://img.shields.io/badge/Version-0.2.0-orange)](package.json)

</div>

---

## 🤔 What is this?

**Invisible** is a cross-platform desktop messenger that takes your privacy so seriously it considered not having a README at all. Every message is end-to-end encrypted — meaning even *we* can't read what you're sending. (Plausible deniability: activated.)

Built on top of [Tauri](https://tauri.app), it pairs a snappy **React + TypeScript** frontend with a **Rust** backend that handles the cryptographic heavy lifting. Think of it as Signal, but if Signal went to the gym and also learned Rust.

---

## 🕹️ Try the demo (no backend required)

Demo mode is fully local. It does **not** contact the server, create real keys, or send messages over the network — perfect for a quick look at the interface.

### Option 1 — download and run the desktop app

1. Open the [latest release](https://github.com/Glitched-Developers/invisible/releases/latest).
2. Download the installer for your OS:
   - **Windows:** `Invisible_windows_*_x64-setup.exe` or `.msi`
   - **Linux:** `.AppImage` or `.deb`
3. Install, launch **Invisible**, and click **Demo mode** on the welcome screen.

### Option 2 — run from source in your browser

```bash
git clone https://github.com/Glitched-Developers/invisible.git
cd invisible
npm install
npm run demo
```

The demo opens at **http://localhost:1420**. Click **Demo mode**. This path needs only Node.js — no Rust, Tauri, `.env`, or backend.

> The demo is a UI/UX preview. Real network messaging, key generation, and file transfer require the full desktop build and the [invisible-backend](https://github.com/Glitched-Developers/invisible-backend/).

---

## ✨ Features

- 🔒 **End-to-end encryption** — your secrets stay yours (we promise we're not interested)
- 💬 **Real-time messaging** — faster than your excuses for not replying
- 📁 **File sharing** — send files without your cloud provider judging your meme collection
- 👤 **Contact management** — organized like your contacts, but actually works
- 🎨 **Theme support** — dark mode included, because we care about your retinas
- 🖥️ **Cross-platform** — Windows, macOS, Linux; we don't discriminate

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | [Tauri 2](https://tauri.app) |
| Frontend | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| UI Components | [Radix UI](https://www.radix-ui.com) + [Tailwind CSS](https://tailwindcss.com) |
| Crypto | X25519 · AES-GCM · Ed25519 · HKDF · HMAC · SHA-2 |
| Build tool | [Vite](https://vitejs.dev) |
| Backend language | [Rust](https://www.rust-lang.org) |

> **Note on cryptography:** Yes, we really do use X25519 key exchange, AES-GCM for symmetric encryption, Ed25519 for signatures, and HKDF for key derivation. We went slightly overboard. No regrets.

---

## 🚀 Full desktop setup

Use this path for real messaging with the backend. For a quick demo, use [Try the demo](#-try-the-demo-no-backend-required) above — it needs no `.env` or Rust.

### Prerequisites

- [Node.js](https://nodejs.org) (18+)
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- [Tauri CLI prerequisites](https://tauri.app/start/prerequisites/) for your OS

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/Glitched-Developers/invisible.git
cd invisible

# 2. Install frontend dependencies
npm install

# 3. Copy the environment config
cp .env.example .env
# Fill in the blanks. Yes, all of them.

# 4. Run in development mode
npm run tauri dev
```

### Building for production

```bash
npm run tauri build
```

The installer will appear in `src-tauri/target/release/bundle/`. You're welcome.

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure the backend URL and any other secrets. Don't commit your `.env` file. Seriously. We've seen things.

The backend lives here: **[invisible-backend](https://github.com/Glitched-Developers/invisible-backend/)**

---

## 🤝 Contributing

Found a bug? Have a feature idea? Want to add *even more* cryptographic algorithms?  
Pull requests are welcome. Please open an issue first so we can argue about it constructively.

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-cool-thing`)
3. Commit your changes (`git commit -m 'Add my cool thing'`)
4. Push and open a PR

---

## 👥 Authors & Contributors

| Role | Person |
|------|--------|
| Organization | [@Glitched-Developers](https://github.com/Glitched-Developers) |
| Core team | [Shizamuru](https://github.com/shizamuru-dev) · [VladN13](https://github.com/VladN13) · [vovakovtyn2008-oss](https://github.com/vovakovtyn2008-oss) |

---

## 📄 License

Licensed under the [Mozilla Public License 2.0](LICENSE).  
TL;DR: open source, share improvements, don't relicense as proprietary. The lawyers made us say that.

---

<div align="center">

*Made with ☕, 🦀 Rust, and an unhealthy obsession with cryptography.*

</div>
