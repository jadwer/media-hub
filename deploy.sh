#!/bin/bash

###############################################################################
# Media Hub - Deployment Script
# Automatiza el proceso de deployment con backup y validaciones
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="${APP_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/pre-deploy-${TIMESTAMP}.tar.gz"

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

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo "═══════════════════════════════════════════════════"
echo "  🚀 Media Hub - Deployment Script"
echo "═══════════════════════════════════════════════════"
echo ""

# Step 1: Verificar que estamos en la rama correcta
log_info "Verificando rama git..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    log_warning "No estás en main/master (rama actual: $CURRENT_BRANCH)"
    read -p "¿Continuar de todos modos? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Deployment cancelado"
        exit 1
    fi
fi
log_success "Rama verificada: $CURRENT_BRANCH"

# Step 2: Verificar estado de git
log_info "Verificando estado de git..."
if [[ -n $(git status -s) ]]; then
    log_warning "Hay cambios sin commitear"
    git status -s
    read -p "¿Continuar de todos modos? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Deployment cancelado"
        exit 1
    fi
fi
log_success "Estado de git verificado"

# Step 3: Crear backup pre-deployment
log_info "Creando backup pre-deployment..."
mkdir -p "$BACKUP_DIR"

# Backup de archivos críticos
tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='backups' \
    --exclude='logs/*.log' \
    .env \
    files/ \
    playlists/ \
    2>/dev/null || true

if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
    log_success "Backup creado: $BACKUP_FILE ($BACKUP_SIZE)"
else
    log_warning "No se pudo crear backup (archivos inexistentes)"
fi

# Step 4: Pull latest changes
log_info "Descargando últimos cambios..."
git pull origin "$CURRENT_BRANCH"
log_success "Código actualizado"

# Step 5: Verificar dependencias PHP
log_info "Verificando dependencias PHP..."
if command -v composer &> /dev/null; then
    if [ -f "composer.json" ]; then
        composer install --no-dev --optimize-autoloader
        log_success "Dependencias PHP instaladas"
    fi
else
    log_warning "Composer no encontrado, saltando instalación de dependencias"
fi

# Step 6: Verificar dependencias Node (si existen)
log_info "Verificando dependencias Node..."
if [ -f "package.json" ]; then
    if command -v npm &> /dev/null; then
        npm install --production
        log_success "Dependencias Node instaladas"
    else
        log_warning "npm no encontrado, saltando instalación"
    fi
fi

# Step 7: Verificar archivo .env
log_info "Verificando configuración..."
if [ ! -f ".env" ]; then
    log_warning "Archivo .env no encontrado"
    if [ -f ".env.example" ]; then
        log_info "Copiando .env.example a .env"
        cp .env.example .env
        log_warning "¡IMPORTANTE! Edita .env con tus credenciales"
    else
        log_error ".env.example tampoco existe"
        exit 1
    fi
else
    log_success "Archivo .env encontrado"
fi

# Step 8: Crear directorios necesarios
log_info "Verificando directorios..."
mkdir -p files logs playlists backups
chmod 755 files logs playlists backups
log_success "Directorios verificados"

# Step 9: Limpiar cache del Service Worker
log_info "Incrementando versión del Service Worker..."
if [ -f "sw.js" ]; then
    # Increment version (simple approach)
    CURRENT_VERSION=$(grep "CACHE_VERSION = 'v" sw.js | sed -E "s/.*'v([0-9.]+)'.*/\1/")
    log_info "Versión actual del SW: v$CURRENT_VERSION"
    log_warning "Recuerda incrementar manualmente CACHE_VERSION en sw.js si hay cambios en assets"
fi

# Step 10: Verificar permisos
log_info "Verificando permisos..."
if [ -w "files" ] && [ -w "logs" ]; then
    log_success "Permisos correctos"
else
    log_warning "Algunos directorios no tienen permisos de escritura"
    log_info "Ejecuta: chmod 755 files logs playlists"
fi

# Step 11: Test rápido de PHP
log_info "Verificando sintaxis PHP..."
PHP_FILES=$(find . -name "*.php" -not -path "./vendor/*" -not -path "./node_modules/*")
PHP_ERRORS=0

for file in $PHP_FILES; do
    if ! php -l "$file" > /dev/null 2>&1; then
        log_error "Error de sintaxis en: $file"
        PHP_ERRORS=$((PHP_ERRORS + 1))
    fi
done

if [ $PHP_ERRORS -eq 0 ]; then
    log_success "Sintaxis PHP correcta"
else
    log_error "Se encontraron $PHP_ERRORS errores de sintaxis"
    exit 1
fi

# Step 12: Limpiar logs viejos (opcional)
log_info "Limpiando logs antiguos (>30 días)..."
if [ -d "logs" ]; then
    find logs -name "*.log" -mtime +30 -delete 2>/dev/null || true
    log_success "Logs antiguos eliminados"
fi

# Step 13: Resumen final
echo ""
echo "═══════════════════════════════════════════════════"
log_success "🎉 Deployment completado exitosamente!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📋 Resumen:"
echo "  - Rama: $CURRENT_BRANCH"
echo "  - Backup: $BACKUP_FILE"
echo "  - Timestamp: $TIMESTAMP"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Verifica que .env tenga las credenciales correctas"
echo "  2. Reinicia el servidor web si es necesario"
echo "  3. Prueba la app en: http://localhost:8000"
echo "  4. Incrementa CACHE_VERSION en sw.js si hay cambios en assets"
echo ""
log_info "Logs disponibles en: logs/"
log_info "Backups disponibles en: backups/"
echo ""

# Success
exit 0
