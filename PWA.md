# 📱 PWA - Progressive Web App

## ¿Qué es una PWA?

Una **Progressive Web App** es una aplicación web que se puede instalar en dispositivos móviles y de escritorio, funcionando como una app nativa con capacidades offline.

## 🎯 Características implementadas

### ✅ Instalable
- La app se puede instalar en dispositivos móviles y escritorio
- Aparece en el cajón de aplicaciones / menú de inicio
- Se ejecuta en ventana independiente (sin barra del navegador)
- Iconos personalizados con gradiente rosa-morado

### ✅ Modo Offline
El Service Worker implementa **cache inteligente** de recursos:

#### Cache de Assets Estáticos
Todos los archivos CSS, JS y assets se cachean en la primera carga:
- `/index.php`, `/login.html`
- Todos los archivos CSS y JS
- Iconos y assets
- Tema metal, dark y light

#### Cache de Archivos Multimedia
Los archivos multimedia se cachean **la primera vez que se reproducen**:
- Audio (mp3, wav, ogg)
- Video (mp4, mov, webm)
- Imágenes (jpg, png, gif, webp)

#### Estrategia de Cache

**Network First (APIs)**
```
API request → Intenta red → Si falla, usa cache → Si no hay cache, error offline
```
- Siempre intenta obtener datos frescos
- Usa cache como fallback
- Perfecto para datos que cambian frecuentemente

**Cache First (Media & Assets)**
```
Media/Asset → Busca en cache → Si no está, busca en red → Cachea para próxima vez
```
- Usa cache primero (más rápido)
- Descarga solo la primera vez
- Perfecto para archivos que no cambian

### ✅ Auto-Update
- Detecta automáticamente nuevas versiones
- Pregunta al usuario si quiere actualizar
- Actualización sin perder datos
- Limpia caches viejos automáticamente

### ✅ Shortcuts (Accesos directos)
La app instalada tiene accesos directos a:
1. **Explorar** - Ver archivos multimedia
2. **Administrar** - Subir y gestionar archivos
3. **Playlists** - Crear y reproducir listas

## 📲 Cómo instalar la app

### Android (Chrome/Edge)
1. Abre `https://tu-dominio.com` en Chrome
2. Toca el menú (⋮) → "Instalar app" o "Agregar a pantalla de inicio"
3. Confirma la instalación
4. La app aparecerá en el cajón de apps

### iOS (Safari)
1. Abre `https://tu-dominio.com` en Safari
2. Toca el botón de compartir (□↑)
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma
5. La app aparecerá en tu pantalla de inicio

### Desktop (Chrome/Edge)
1. Abre `https://tu-dominio.com`
2. Mira el icono de instalación en la barra de direcciones (+)
3. Haz clic en "Instalar"
4. La app se abrirá en ventana independiente

## 🔧 Gestión de Cache

### Ver qué está cacheado
Abre DevTools → Application → Cache Storage

Verás 3 caches:
- `mediahub-static-v1.3.0` - Assets estáticos (CSS, JS)
- `mediahub-media-v1.3.0` - Archivos multimedia
- `mediahub-api-v1.3.0` - Respuestas de API

### Limpiar cache manualmente
Desde la consola del navegador:
```javascript
// Enviar mensaje al Service Worker para limpiar cache
navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
```

### Desregistrar Service Worker
```javascript
// Desregistrar completamente
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});
```

## 🚀 Beneficios

### Para el usuario:
- ✅ **Instalación fácil** - Un clic para instalar
- ✅ **Acceso rápido** - Abre desde el escritorio/home
- ✅ **Funciona offline** - Reproduce archivos ya vistos sin internet
- ✅ **Menos datos** - Archivos se cachean, no se descargan de nuevo
- ✅ **Experiencia nativa** - Ventana propia, sin barra del navegador
- ✅ **Actualizaciones automáticas** - Siempre la última versión

### Para el servidor:
- ✅ **Menos requests** - Assets y media se sirven desde cache
- ✅ **Ahorro de ancho de banda** - Solo se descarga una vez
- ✅ **Mejor rendimiento** - Cache local es instantáneo

## 📊 Uso de almacenamiento

El Service Worker puede usar hasta **60% del espacio disponible** en el dispositivo.

Ejemplo de tamaños:
- Assets estáticos: ~1-2 MB
- 10 canciones (5MB c/u): ~50 MB
- 5 videos (20MB c/u): ~100 MB
- Total típico: 150-200 MB

El navegador gestiona automáticamente la limpieza si se queda sin espacio.

## 🔒 Seguridad

### HTTPS Requerido
PWAs **requieren HTTPS** (excepto en localhost para desarrollo).

Sin HTTPS:
- ❌ Service Worker no funciona
- ❌ No se puede instalar
- ❌ No hay cache offline

Con HTTPS:
- ✅ Todo funciona perfectamente
- ✅ Sesiones seguras
- ✅ Datos encriptados

### Autenticación
El Service Worker **respeta la autenticación**:
- Cache solo funciona para usuarios autenticados
- Sesión requerida para APIs
- Logout limpia el contexto

## 🐛 Troubleshooting

### La app no se instala
1. Verifica que estés usando **HTTPS** (o localhost)
2. Asegúrate que `manifest.json` sea accesible
3. Revisa que los iconos existan

### Service Worker no se registra
1. Abre DevTools → Console
2. Busca errores del SW
3. Verifica que `/sw.js` sea accesible
4. Confirma que el navegador soporte Service Workers

### Cache no funciona
1. DevTools → Application → Service Workers
2. Verifica que esté "Activated and running"
3. Revisa Cache Storage para ver qué está cacheado
4. Intenta "Update on reload" para forzar actualización

### Desinstalar la app
**Android/iOS:**
- Mantén presionado el icono → Desinstalar

**Desktop:**
- Abre la app instalada
- Menú (⋮) → Desinstalar

## 📝 Archivos PWA

```
/
├── manifest.json          # Configuración PWA
├── sw.js                 # Service Worker
├── assets/
│   ├── icon-192.svg      # Icono 192x192
│   └── icon-512.svg      # Icono 512x512
└── index.php             # Registro del SW
```

## 🔄 Actualizaciones

Cuando subes una nueva versión:

1. Cambia `CACHE_VERSION` en `sw.js`:
   ```javascript
   const CACHE_VERSION = 'v1.4.0'; // Incrementa versión
   ```

2. Los usuarios verán: "Nueva versión disponible. ¿Recargar?"

3. Al aceptar:
   - Se descarga el nuevo SW
   - Se limpian caches viejos
   - Se aplica la actualización

## 📱 Compatibilidad

| Navegador | Instalable | Service Worker | Offline |
|-----------|-----------|----------------|---------|
| Chrome Desktop | ✅ | ✅ | ✅ |
| Chrome Android | ✅ | ✅ | ✅ |
| Edge Desktop | ✅ | ✅ | ✅ |
| Safari iOS 16+ | ✅ | ✅ | ✅ |
| Firefox Desktop | ⚠️ | ✅ | ✅ |
| Samsung Internet | ✅ | ✅ | ✅ |

✅ Soporte completo | ⚠️ Soporte parcial

---

**Versión PWA:** 1.3.0
**Última actualización:** 2025-10-03
