#!/bin/bash

###############################################################################
# Media Hub - Backup Script
# Crea backups automáticos de archivos y configuración
# Uso: ./backup.sh [daily|manual]
###############################################################################

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_BASE_DIR="${APP_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_ONLY=$(date +%Y%m%d)

# Backup type (daily or manual)
BACKUP_TYPE="${1:-manual}"

if [ "$BACKUP_TYPE" == "daily" ]; then
    BACKUP_DIR="${BACKUP_BASE_DIR}/daily"
    BACKUP_FILE="${BACKUP_DIR}/backup-${DATE_ONLY}.tar.gz"
else
    BACKUP_DIR="${BACKUP_BASE_DIR}/manual"
    BACKUP_FILE="${BACKUP_DIR}/backup-${TIMESTAMP}.tar.gz"
fi

# Retention days
RETENTION_DAYS=7

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Banner
echo "═══════════════════════════════════════════════════"
echo "  💾 Media Hub - Backup Script"
echo "  Type: $BACKUP_TYPE"
echo "═══════════════════════════════════════════════════"
echo ""

# Step 1: Crear directorios de backup
log_info "Preparando directorios de backup..."
mkdir -p "$BACKUP_DIR"
mkdir -p "${BACKUP_BASE_DIR}/daily"
mkdir -p "${BACKUP_BASE_DIR}/manual"
log_success "Directorios creados"

# Step 2: Verificar qué archivos incluir
log_info "Verificando archivos a respaldar..."

ITEMS_TO_BACKUP=""

# Files directory (archivos multimedia)
if [ -d "files" ]; then
    FILE_COUNT=$(find files -type f | wc -l)
    FILE_SIZE=$(du -sh files 2>/dev/null | cut -f1 || echo "0")
    log_info "  - files/: $FILE_COUNT archivos ($FILE_SIZE)"
    ITEMS_TO_BACKUP="$ITEMS_TO_BACKUP files/"
fi

# Playlists
if [ -d "playlists" ]; then
    PLAYLIST_COUNT=$(find playlists -name "*.json" | wc -l)
    log_info "  - playlists/: $PLAYLIST_COUNT playlists"
    ITEMS_TO_BACKUP="$ITEMS_TO_BACKUP playlists/"
fi

# .env file
if [ -f ".env" ]; then
    log_info "  - .env: Configuración"
    ITEMS_TO_BACKUP="$ITEMS_TO_BACKUP .env"
fi

# Database/data files (if any)
if [ -d "data" ]; then
    log_info "  - data/: Base de datos"
    ITEMS_TO_BACKUP="$ITEMS_TO_BACKUP data/"
fi

if [ -z "$ITEMS_TO_BACKUP" ]; then
    log_warning "No hay archivos para respaldar"
    exit 1
fi

# Step 3: Crear backup
log_info "Creando archivo de backup..."
log_info "Destino: $BACKUP_FILE"

tar -czf "$BACKUP_FILE" $ITEMS_TO_BACKUP 2>/dev/null

if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
    log_success "Backup creado: $BACKUP_SIZE"
else
    log_warning "Error al crear backup"
    exit 1
fi

# Step 4: Rotar backups antiguos (solo para daily)
if [ "$BACKUP_TYPE" == "daily" ]; then
    log_info "Rotando backups antiguos (>${RETENTION_DAYS} días)..."

    DELETED_COUNT=0
    while IFS= read -r old_backup; do
        if [ -f "$old_backup" ]; then
            rm "$old_backup"
            DELETED_COUNT=$((DELETED_COUNT + 1))
            log_info "  - Eliminado: $(basename "$old_backup")"
        fi
    done < <(find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +${RETENTION_DAYS})

    if [ $DELETED_COUNT -gt 0 ]; then
        log_success "Eliminados $DELETED_COUNT backups antiguos"
    else
        log_info "No hay backups antiguos para eliminar"
    fi
fi

# Step 5: Listar backups existentes
log_info "Backups disponibles:"

# Daily backups
DAILY_COUNT=$(find "${BACKUP_BASE_DIR}/daily" -name "backup-*.tar.gz" 2>/dev/null | wc -l)
DAILY_SIZE=$(du -sh "${BACKUP_BASE_DIR}/daily" 2>/dev/null | cut -f1 || echo "0")
echo "  📅 Daily: $DAILY_COUNT backups ($DAILY_SIZE)"

# Manual backups
MANUAL_COUNT=$(find "${BACKUP_BASE_DIR}/manual" -name "backup-*.tar.gz" 2>/dev/null | wc -l)
MANUAL_SIZE=$(du -sh "${BACKUP_BASE_DIR}/manual" 2>/dev/null | cut -f1 || echo "0")
echo "  🔧 Manual: $MANUAL_COUNT backups ($MANUAL_SIZE)"

# Step 6: Verificar integridad del backup (opcional)
log_info "Verificando integridad..."
if tar -tzf "$BACKUP_FILE" > /dev/null 2>&1; then
    log_success "Backup verificado correctamente"
else
    log_warning "Error al verificar backup"
    exit 1
fi

# Step 7: Crear archivo de metadata
METADATA_FILE="${BACKUP_FILE}.meta"
cat > "$METADATA_FILE" << EOF
Backup Metadata
===============
Fecha: $(date)
Tipo: $BACKUP_TYPE
Archivo: $(basename "$BACKUP_FILE")
Tamaño: $BACKUP_SIZE
Contenido:
$(tar -tzf "$BACKUP_FILE" | head -20)
...

Total archivos: $(tar -tzf "$BACKUP_FILE" | wc -l)
EOF

log_success "Metadata guardado: $(basename "$METADATA_FILE")"

# Resumen final
echo ""
echo "═══════════════════════════════════════════════════"
log_success "💾 Backup completado exitosamente!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📋 Resumen:"
echo "  - Archivo: $BACKUP_FILE"
echo "  - Tamaño: $BACKUP_SIZE"
echo "  - Tipo: $BACKUP_TYPE"
echo "  - Timestamp: $TIMESTAMP"
echo ""
echo "🔄 Para restaurar:"
echo "  tar -xzf $BACKUP_FILE -C /"
echo ""
echo "📂 Ubicación de backups:"
echo "  - Daily:  ${BACKUP_BASE_DIR}/daily/"
echo "  - Manual: ${BACKUP_BASE_DIR}/manual/"
echo ""

# Success
exit 0
