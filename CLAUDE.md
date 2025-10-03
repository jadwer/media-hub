# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Media Hub** is a private multimedia management SPA for Jazmín and Gabino. Built with vanilla JavaScript (ES modules) and PHP backend, featuring audio/video/image upload, preview, playback, and dynamic theming with a special "pink-metal" mode that plays a guitar riff.

## Development Commands

### Running the Application
```bash
php -S localhost:8000
```
The app will be available at `http://localhost:8000`

### Testing
```bash
npm test          # Run all tests with Vitest
```

Tests are located in `js/api/index.test.js` and `js/ui/fileViewer.test.js`

## Architecture Overview

### Frontend (Vanilla JS + ES Modules)

**Entry Point**: `js/main.js`
- Initializes the app on DOMContentLoaded
- Coordinates all UI modules
- Manages global state (`files`, `filteredFiles`, `currentPage`)
- Sets up event listeners for theme toggle, search, pagination, and file interactions

**Module Structure**:
- `js/api/index.js` - API communication layer (getFiles, uploadFile)
- `js/ui/fileViewer.js` - Renders file list with pagination (6 items per page), handles search
- `js/ui/uploader.js` - Drag-and-drop uploader with multi-file support, preview generation
- `js/ui/themeManager.js` - Theme switching (light/dark/metal), persists to localStorage
- `js/ui/player.js` - Audio playback and file download functionality
- `js/utils/debounce.js` - Utility function for debouncing

**Key Frontend Patterns**:
- All state managed in `main.js` - modules are stateless and functional
- Event delegation used for dynamically rendered file controls (play/download buttons)
- File previews generated client-side using `URL.createObjectURL()`
- Guitar riff plays when "metal" theme is activated OR after successful upload (if metal theme is active)

### Backend (PHP)

**API Endpoints**:

#### `GET /api/v1.php` - List Files
Lists files with filtering, sorting, and pagination.

**Query Parameters:**
- `type` (string, optional) - Filter by file type: `all`, `audio`, `video`, `image`. Default: `all`
- `order` (string, optional) - Sort order: `date_desc`, `date_asc`, `name_desc`, `name_asc`. Default: `date_desc`
- `page` (integer, optional) - Page number for pagination. Default: `1`
- `perPage` (integer, optional) - Items per page. Default: `10`

**Response Format:**
```json
{
  "type": "audio",
  "page": 1,
  "perPage": 10,
  "total": 25,
  "order": "date_desc",
  "files": [
    {
      "name": "song.mp3",
      "url": "/files/song.mp3",
      "sizeMB": 3.45,
      "modified": "2025-05-01 12:00:00",
      "type": "audio",
      "extension": "mp3"
    }
  ]
}
```

**Implementation Details:**
- Scans `/files/` directory for matching files
- Filters by type if specified
- Sorts based on `order` parameter (name or modification date)
- Returns paginated subset of results
- File type determined by extension using `getFileType()` utility

#### `POST /api/upload.php` - Upload Files
Uploads one or multiple files to the server.

**Request Format:**
- Content-Type: `multipart/form-data`
- Field name: `archivo[]` (array notation for multiple files)
- Max file size: 20MB per file

**Allowed File Types:**
- Audio: mp3, wav, ogg
- Video: mp4, mov, webm
- Image: jpg, jpeg, png, gif, webp

**Response Format:**
```json
{
  "success": true,
  "uploaded": 3,
  "errors": [],
  "meta": {
    "uploadDir": "/path/to/files/",
    "files": [...]
  }
}
```

**Validation:**
1. Extension validation against allowed list
2. MIME type validation using `mime_content_type()`
3. File size validation (max 20MB)
4. Filename sanitization (transliteration, special char removal)
5. Duplicate handling (auto-increment with `-N` suffix)

**Error Handling:**
- Returns `success: false` if no files uploaded successfully
- `errors` array contains specific error messages per file
- Partial success possible (some files upload, others fail)

**Configuration**:
- `config.php` - Environment-aware paths (local vs production)
  - Set `APP_ENV` environment variable to switch between 'local' and 'production'
  - Defines file storage folder and web path for each environment
- `api/utils.php` - Shared utility functions (file type detection, etc.)

**File Storage**:
- Files stored in `files/` directory
- Allowed types: audio (mp3, wav, ogg), video (mp4, mov, webm), image (jpg, jpeg, png, gif, webp)

### Theming System

Three themes available: `light`, `dark`, `metal` (default)
- Theme stylesheets in `styles/themes/*.css`
- Theme preference persisted to localStorage
- Metal theme triggers guitar riff sound effect (`assets/riff.mp3`)
- Toggle button cycles: metal → dark → light → metal

### Key Implementation Details

- **Multiple file uploads**: Frontend sends FormData with `archivo[]` keys, backend handles array normalization
- **Client-side pagination**: Frontend receives all files matching criteria, paginates locally (6 per page)
- **Search**: Filters files by name match, resets to page 1 on new search
- **Preview system**: Shows different preview elements based on MIME type (img/audio/video tags)
- **Filename sanitization**: Backend transliterates UTF-8 to ASCII, removes special chars, handles duplicates

## Security & Authentication (Fase 4)

### Authentication System
- **Login page**: `/login.html` - Beautiful gradient login interface
- **Session management**: PHP sessions with secure settings (httponly, samesite, strict mode)
- **CSRF protection**: Tokens validated on all state-changing requests (POST/PUT/DELETE)
- **Auto-redirect**: Unauthenticated users redirected to login automatically

### API Endpoints (Auth)
- `POST /api/auth.php` - Login with username/password
- `DELETE /api/auth.php` - Logout
- `GET /api/auth.php` - Check session status

### Security Headers
All pages serve security headers via `api/security.php`:
- **CSP**: Content Security Policy to prevent XSS
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **HSTS**: Enabled when using HTTPS
- **Permissions-Policy**: Restricts browser features

### Rate Limiting
Implemented via `api/rateLimit.php`:
- **Uploads**: Max 10 per minute (configurable via `.env`)
- **Deletions**: Max 20 per minute
- **API calls**: Max 100 per minute
- Returns 429 status with `retry_after` when exceeded

### Error Logging
All errors logged to `logs/app.log` via `api/logger.php`:
- Login/logout events
- Failed authentication attempts
- PHP errors and exceptions
- Rate limit violations
- Includes timestamp, user, IP, and context

### Environment Configuration
Settings stored in `.env` file (not committed to git):
```bash
APP_ENV=local
AUTH_USERNAME=admin
AUTH_PASSWORD=your_secure_password
SESSION_LIFETIME=3600
MAX_UPLOADS_PER_MINUTE=10
```

### Frontend Auth Integration
- `js/utils/auth.js` - Authentication utilities
- `authFetch()` wrapper automatically includes CSRF tokens
- All API calls in `js/api/index.js` use authenticated fetch
- Session check on app initialization in `main.js`
- Logout button in header

## Deployment & Production (Fase 4 completada)

### Deployment Script (`deploy.sh`)
Script automatizado para deployment seguro:
- Verifica rama git y estado
- Crea backup pre-deployment
- Pull de últimos cambios
- Instala dependencias (composer, npm)
- Verifica sintaxis PHP
- Limpia logs antiguos (>30 días)
- Valida permisos de directorios

**Uso:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Backup System (`backup.sh`)
Sistema de backup automático con rotación:
- **Daily backups**: Rotación de 7 días automática
- **Manual backups**: Sin rotación, guardado permanente
- Incluye: files/, playlists/, .env, data/
- Compresión tar.gz con verificación de integridad
- Metadata de cada backup

**Uso:**
```bash
chmod +x backup.sh
./backup.sh daily    # Backup con rotación
./backup.sh manual   # Backup sin rotación
```

**Configurar cron job** (ver `CRON_SETUP.md`):
```cron
0 2 * * * cd /path/to/audio-hub && ./backup.sh daily >> logs/backup.log 2>&1
```

### Storage Monitoring (`api/storage.php`)
Endpoint protegido que proporciona estadísticas detalladas:
- Uso de disco (total, usado, libre, porcentaje)
- Estadísticas por tipo de archivo (audio, video, imagen)
- Conteo de archivos y playlists
- Tamaño de logs y backups
- Alertas automáticas (>80% = warning, >90% = critical)
- Dashboard visual en sección "Administrar"

**Response example:**
```json
{
  "success": true,
  "status": "ok",
  "disk": {
    "used_percent": 45.5,
    "used_formatted": "450 GB",
    "free_formatted": "550 GB"
  },
  "app": {
    "files": {
      "count": 150,
      "size_formatted": "2.3 GB",
      "by_type": {
        "audio": 80,
        "video": 50,
        "image": 20
      }
    }
  },
  "warnings": []
}
```

### PWA (Progressive Web App)
App instalable con modo offline:
- **manifest.json**: Configuración PWA con iconos y shortcuts
- **Service Worker** (`sw.js`): Cache inteligente
  - Network First para APIs (datos frescos)
  - Cache First para media y assets (velocidad)
  - Auto-update con confirmación de usuario
- **Instalable** en Android, iOS y Desktop
- **Modo offline**: Assets y media reproducida funcionan sin internet

**Cache strategy:**
```
Assets estáticos  → Cache First (CSS, JS, iconos)
Archivos media    → Cache First (reproducidos quedan offline)
API requests      → Network First (datos frescos, fallback a cache)
```

## Important Notes

- No build process required - uses native ES modules
- PHP 8.0+ required for arrow function syntax
- Test environment uses `happy-dom` for DOM simulation with Vitest
- **Main entry point**: `index.php` (renamed from index.html for security headers)
- **Authentication required**: All endpoints protected except `/login.html` and `/api/auth.php`
- **Deployment**: Use `./deploy.sh` for safe deployments
- **Backups**: Configured with `./backup.sh daily` via cron
- **Monitoring**: Storage dashboard in "Administrar" section
- The project is designed for private use between two people (Jaz & Gabo)
