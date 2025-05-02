# 🎧 Media Hub — Audio Library for Jaz & Gabo

**Media Hub** is a single-page application (SPA) crafted with love for private multimedia management and sharing between Jazmín and Gabino.  
Built with vanilla JavaScript and PHP, it features a clean and modern interface, modular architecture, and personalized theming — including a pink-metal mode with a guitar riff sound effect.

---

## 🌟 Features

- 🎵 Upload one or multiple audio/video/image files
- 🖼️ Instant preview for compatible media
- 📂 Paginated navigation
- 🔍 Real-time name-based search
- 🎧 Built-in audio player
- 🎨 Dynamic theming (light, dark, pink-metal)
- 🤘 Plays a riff when pink-metal theme is activated or after upload
- 🔐 File extension and MIME type validation in the backend
- ⚡ SPA-like experience — no full page reloads

---

## 🛠 Requirements

- PHP >= 8.0
- Local server (e.g., `php -S localhost:8000`)
- Modern browser

---

## 🚀 Local Installation

```bash
git clone https://github.com/your-username/media-hub.git
cd media-hub
php -S localhost:8000

## project structure

media-hub/
├── api/
│   ├── upload.php
│   └── v1.php
├── assets/
│   ├── logo.svg
│   └── riff.mp3
├── files/
├── js/
│   ├── api/
│   │   └── index.js
│   ├── ui/
│   │   ├── themeManager.js
│   │   ├── fileViewer.js
│   │   ├── uploader.js
│   │   └── player.js
│   └── main.js
├── styles/
│   ├── index.css
│   └── themes/
│       ├── light.css
│       ├── dark.css
│       └── metal.css
├── index.html
└── README.md

---

## 📦 Changelog
[1.1.0] – 2025-05-02
- 🔁 Full refactor to ESModules
- 📤 Support for multiple file uploads
- 🧼 Refined drag & drop with dynamic previews
- 🎧 Global audio player with click-to-play
- 🎨 Theme switching system (light/dark/metal)
- 🎸 Guitar riff added to metal theme activation and upload
- 🧾 Pagination and search now fully decoupled
- ✅ Improved backend validation and frontend feedback


--------------------

# 🎧 Media Hub — Biblioteca de Audio de Jaz & Gabo

**Media Hub** es una aplicación de una sola página (SPA) diseñada con cariño para que Jazmín y Gabino puedan cargar, organizar, previsualizar y disfrutar archivos multimedia (audio, video, imágenes) de forma privada y sencilla.  
Construido con vanilla JS + PHP, con un enfoque modular, visual y temático.

---

## 🌈 Características

- 🎵 Subida de archivos (uno o varios) con vista previa
- 📂 Navegación paginada
- 🔍 Búsqueda por nombre en tiempo real
- 🎧 Reproductor de audio integrado
- 🎨 Cambios de tema (claro, oscuro y rosa-metal)
- 🤘 Reproduce un riff si estás en modo metal
- 🔒 Validación de extensiones y tipos MIME en backend
- 🧼 Interfaz limpia y enfocada en la experiencia

---

## 🛠 Requisitos

- PHP >= 8.0
- Servidor local: `php -S localhost:8000`
- Navegador moderno

---

## 🚀 Instalación local

```bash
git clone https://github.com/tuusuario/media-hub.git
cd media-hub
php -S localhost:8000

---
## Estructura del proyecto

media-hub/
├── api/
│   ├── upload.php
│   └── v1.php
├── assets/
│   ├── logo.svg
│   └── riff.mp3
├── files/
├── js/
│   ├── api/
│   │   └── index.js
│   ├── ui/
│   │   ├── themeManager.js
│   │   ├── fileViewer.js
│   │   ├── uploader.js
│   │   └── player.js
│   └── main.js
├── styles/
│   ├── index.css
│   └── themes/
│       ├── light.css
│       ├── dark.css
│       └── metal.css
├── index.html
└── README.md

##🧾 Historial de cambios

[1.1.0] - 2025-05-02
- 🔁 Refactor completo a ESModules
- 🎨 Sistema de temas dinámicos + modo "metal"
- 🎸 Riff sonoro cuando se activa tema metal o tras subir archivos
- 📤 Soporte para subida múltiple de archivos con validación
- 📄 Vista previa de imágenes/audio/video
- 📚 Nueva paginación funcional y desacoplada
- 🚫 Eliminación del uso de window.* para estado interno
- ✅ Mejor manejo de errores en frontend/backend