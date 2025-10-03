# 🗺️ Media Hub - Roadmap de Desarrollo

## 📋 Plan de Mejoras y Objetivos

---

## ✅ FASE 1: Estabilización y Corrección de Bugs (1-2 días)

### 1.1 Corrección de errores críticos
- [x] Fix error en `js/ui/uploader.js` línea 51 (`error` → `response`)
- [x] Crear `vitest.config.js` con configuración correcta
- [x] Arreglar imports en `js/ui/fileViewer.test.js` (alias `@ui/`)
- [x] Verificar que todos los tests pasen con `npm test`

### 1.2 Limpieza del repositorio
- [x] Eliminar archivos duplicados en `/files/` (Queen Bohemian Rhapsody duplicado)
- [x] Verificar que `.gitignore` esté funcionando correctamente
- [x] Actualizar dependencias si hay vulnerabilidades

### 1.3 Documentación
- [x] CLAUDE.md creado y actualizado
- [x] Agregar comentarios JSDoc a funciones principales
- [x] Documentar endpoints de API en CLAUDE.md

**Checkpoint 1:** Proyecto estable, tests pasando, sin errores en consola

---

## 🎬 FASE 2: Reproductor Multimedia Mejorado + Gestión de Archivos (2-3 días)

### 2.1 Reproductor multimedia universal
- [x] Extender `player.js` para soportar video
- [x] Implementar visualizador de imágenes (lightbox/modal)
- [x] Agregar controles avanzados:
  - [x] Control de velocidad de reproducción
  - [x] Modo pantalla completa para video
  - [x] Navegación entre archivos (siguiente/anterior)
  - [x] Atajos de teclado (espacio para play/pause, flechas para navegar)

### 2.2 Eliminación de archivos
- [x] Crear endpoint `api/delete.php` (POST con validación)
- [x] Agregar botón de eliminar en cada archivo de la UI
- [x] Implementar modal de confirmación antes de borrar
- [x] Actualizar lista después de eliminar sin recargar página
- [ ] Agregar tests para endpoint DELETE

### 2.3 Mejoras UX
- [x] Reemplazar `alert()` por sistema de notificaciones toast
- [x] Agregar estados de loading más visuales
- [x] Animaciones suaves para transiciones
- [x] Indicador de archivo actualmente reproduciendo

### 2.4 Paginación
- [x] Migrar de paginación client-side a server-side
- [x] Agregar selector de items por página (5/10/20/50/todos)
- [x] Implementar navegación prev/next
- [x] Mostrar información de paginación ("1-10 de 21 (Pág. 1/3)")
- [x] Default de 10 items por página

**Checkpoint 2:** ✅ Reproductor completo, gestión CRUD de archivos funcional, UX mejorada, paginación implementada

---

## ⚡ FASE 3: Optimización y UX Avanzada (3-5 días)

### 3.1 Optimización de rendimiento
- [x] Implementar paginación server-side en `api/v1.php` (completado en Fase 2.4)
- [ ] Lazy loading de thumbnails para imágenes
- [ ] Caché de metadatos en backend
- [ ] Optimizar consultas de archivos grandes (>100 archivos)
- [ ] Agregar índice/base de datos SQLite (opcional)

### 3.2 Mejoras de interfaz
- [x] Implementar vista de grid (cuadrícula) además de lista
- [x] Toggle entre vista lista/grid
- [x] Ordenamiento por columnas clickeables (nombre, fecha, tamaño, tipo)
- [x] Persistencia de preferencia de vista en localStorage
- [x] Filtros avanzados:
  - [x] Rango de tamaño (< 1MB, 1-10MB, 10-50MB, > 50MB)
  - [x] Filtro por tipo (audio/video/imagen)
  - [x] Toggle expandible/colapsable
  - [x] Botón de limpiar filtros
  - [ ] Rango de fechas (futuro)
- [x] Selección múltiple de archivos
- [x] Acciones batch (eliminar múltiples, descargar múltiples)
- [x] Checkbox "Seleccionar todos"
- [x] Barra de acciones batch con contador de seleccionados

### 3.3 Gestión de uploads
- [x] Barra de progreso para uploads
- [x] Preview antes de subir con opción de cancelar
- [x] Validación de tamaño en cliente antes de subir (máx 50MB)
- [x] Cola de uploads (subir múltiples archivos en secuencia)
- [x] Reintentar upload si falla
- [x] Cancelar upload en progreso
- [x] Mostrar tamaño total y cantidad de archivos
- [x] Vista previa mejorada con grid responsive

### 3.4 Funcionalidad de edición
- [x] Renombrar archivos desde la UI
- [x] Endpoint `api/rename.php` con validación completa
- [x] Validación de nombres únicos
- [x] Actualización en tiempo real
- [x] Modal con preview del nombre actual
- [x] Validación de caracteres permitidos
- [x] Prevenir cambio de extensión
- [x] Botón de renombrar con emoji ✏️

### 3.5 Rediseño de arquitectura UX (Nueva propuesta)
- [x] **Layout principal con sidebar:**
  - [x] Crear sidebar de navegación (izquierda)
  - [x] Área de contenido principal (centro)
  - [x] Reproductor fijo en parte inferior
  - [x] Diseño responsive (colapsar sidebar en móvil)

- [x] **Sistema de secciones/vistas:**
  - [x] Vista 1: Buscar archivos (explorar biblioteca)
  - [x] Vista 2: Administrar archivos (upload, eliminar, renombrar)
  - [x] Vista 3: Listas de reproducción (crear, editar, reproducir)
  - [x] Navegación entre secciones sin recargar página

- [x] **Reproductor mejorado inferior:**
  - [x] Siempre visible (position: fixed bottom)
  - [x] Controles de reproducción completos
  - [x] Mostrar archivo actual con miniatura
  - [x] Lista de reproducción actual visible
  - [x] Auto-avance a siguiente archivo
  - [x] Temporizador de 5 segundos para imágenes

- [x] **Sistema de Playlists:**
  - [x] Backend: Endpoint para crear/editar/eliminar playlists (JSON)
  - [x] Almacenamiento en JSON
  - [x] CRUD completo de playlists
  - [x] Agregar/quitar archivos de playlist
  - [x] Reproducir playlist completa
  - [x] Guardar orden de reproducción
  - [ ] Compartir playlists (futuro)

**Checkpoint 3:** Experiencia fluida, optimizada para muchos archivos, arquitectura moderna con sidebar y reproductor persistente

---

## 🔒 FASE 4: Seguridad y Producción (2-3 días)

### 4.1 Autenticación básica
- [x] Sistema de login simple (usuario/contraseña)
- [x] Sesiones PHP seguras
- [x] Proteger todos los endpoints con autenticación
- [x] Logout y timeout de sesión
- [x] Variables de entorno para credenciales

### 4.2 Seguridad
- [x] Rate limiting para uploads (max uploads por minuto)
- [x] CSRF tokens en formularios
- [x] Headers de seguridad (CSP, X-Frame-Options)
- [x] Sanitización de nombres de archivo (ya implementado)
- [ ] Validación de tamaño máximo total de almacenamiento

### 4.3 Preparación para producción
- [x] Configuración de entorno `.env`
- [ ] Script de deployment
- [ ] Backup automático de archivos
- [x] Logging de errores
- [ ] Monitoreo de espacio en disco

**Checkpoint 4:** ✅ **COMPLETADA (Core)** - Sistema de autenticación, seguridad y logging implementados

---

## 🚀 FASE 5: Features Avanzadas (Nice to Have - Futuro)

### 5.1 Gestión de almacenamiento
- [ ] Dashboard con estadísticas (espacio usado, archivos por tipo)
- [ ] Límite de cuota por usuario
- [ ] Limpieza automática de archivos antiguos
- [ ] Compresión de imágenes al subir

### 5.2 Playlists y organización (Movido a Fase 3.5)
- [x] Sistema de playlists implementado en Fase 3.5
- [ ] Sistema de carpetas/álbumes
- [ ] Tags personalizados
- [ ] Favoritos/marcadores
- [ ] Búsqueda por tags

### 5.3 Compartir y colaboración
- [ ] Generar enlaces de compartir con expiración
- [ ] Contraseña para archivos compartidos
- [ ] Vista pública sin login para enlaces
- [ ] Estadísticas de descargas

### 5.4 PWA y offline
- [x] Service Worker para caché
- [x] Modo offline básico
- [x] Instalable como app
- [x] Manifest.json configurado
- [x] Iconos PWA (SVG gradiente)
- [x] Cache de assets estáticos
- [x] Cache de archivos multimedia reproducidos
- [x] Estrategia Network First para APIs
- [x] Estrategia Cache First para media
- [x] Auto-update con confirmación
- [ ] Notificaciones push (opcional)

### 5.5 Experiencia multimedia
- [ ] Ecualizador para audio
- [ ] Modo visualizador de espectro
- [ ] Edición básica de metadatos (ID3 tags)
- [ ] Extracción de artwork de archivos de audio
- [ ] Historial de reproducción

**Checkpoint 5:** Aplicación completa de gestión multimedia

---

## 📊 Métricas de Éxito

### Fase 1
- ✅ 0 errores en consola
- ✅ 100% tests pasando
- ✅ Código limpio y documentado

### Fase 2
- ✅ Reproducción de audio/video/imagen funcional
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ UX sin alerts nativos

### Fase 3
- ✅ Carga de 500+ archivos sin lag
- ✅ Tiempo de respuesta < 500ms
- ✅ Vista grid y lista funcionales

### Fase 4
- ✅ Autenticación funcional
- ✅ Sin vulnerabilidades críticas
- ✅ Listo para deploy

---

## 🛠️ Stack Tecnológico

**Frontend:**
- Vanilla JavaScript (ES Modules)
- CSS3 con temas dinámicos
- Vitest para testing

**Backend:**
- PHP 8.0+
- PHPUnit para testing
- File system para almacenamiento

**DevOps:**
- PHP Built-in Server (desarrollo)
- Git para control de versiones

---

## 📝 Notas

- Mantener compatibilidad con PHP 8.0+
- No agregar frameworks pesados (mantener vanilla JS)
- Priorizar UX sobre features complejas
- Diseño mobile-friendly en todas las fases
- Commits descriptivos y frecuentes

---

**Última actualización:** 2025-10-03
**Versión actual:** 1.1.0
**Próxima versión planeada:** 1.2.0 (Fase 2 completada)

---

## ✅ Progreso Actual

- **Fase 1:** ✅ Completada
- **Fase 2:** ✅ Completada (incluyendo paginación)
- **Fase 3:** ✅ **COMPLETADA** - ¡La gran transformación realizada!
  - ✅ 3.1: Paginación server-side
  - ✅ 3.2: Vista grid/lista y ordenamiento
  - ✅ 3.3: Gestión de uploads mejorada
  - ✅ 3.4: Renombrar archivos
  - ✅ 3.5: Rediseño UX completo (sidebar + reproductor inferior + playlists)
- **Fase 4:** ✅ **COMPLETADA (Core)** - Sistema seguro listo para producción
  - ✅ 4.1: Autenticación completa con login/logout
  - ✅ 4.2: CSRF tokens, rate limiting, headers de seguridad
  - ✅ 4.3: Variables de entorno (.env) y logging de errores
  - ✅ **BONUS**: PWA instalable con Service Worker y modo offline
  - 🎯 **PENDIENTE**: Script deployment, backups automáticos, monitoreo
- **Fase 5:** ✅ **PWA COMPLETADA** - App instalable con modo offline
  - ✅ 5.4: Service Worker, cache, instalable, auto-update
  - ⏳ Resto de features avanzadas pendientes

---

## 🎨 Propuesta de Arquitectura UX (Fase 3.5)

### Mockup conceptual del layout:

```
┌─────────────────────────────────────────────────────────┐
│ 🎧 Media Hub                                 [🌓 Theme] │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ SIDEBAR  │           CONTENIDO PRINCIPAL               │
│          │                                              │
│ 🔍 Buscar│  [Vista activa según selección del sidebar] │
│          │                                              │
│ 📁 Admin │  - Buscar: Grid/Lista de archivos           │
│          │  - Admin: Upload + Gestión                  │
│ 📋 Lists │  - Playlists: Crear/Editar listas          │
│          │                                              │
│          │                                              │
├──────────┴──────────────────────────────────────────────┤
│ ▶ Now Playing: archivo.mp3        [⏮ ⏯ ⏭] [🔊] [📋]  │
│ ▰▰▰▰▰▰▰▰▱▱▱▱▱▱ 2:34 / 4:12                            │
└─────────────────────────────────────────────────────────┘
```

### Flujo de navegación:

1. **Buscar archivos** → Explorar biblioteca completa (actual)
2. **Administrar** → Upload, renombrar, eliminar (concentrado)
3. **Playlists** → Ver listas, crear nuevas, editar existentes

### Beneficios:
- ✅ Navegación clara y organizada
- ✅ Reproductor siempre accesible
- ✅ Playlists con autoplay
- ✅ Imágenes con timer (5s) en slideshow
- ✅ Separación de funciones (búsqueda vs administración)
- ✅ Escalable para futuras features
