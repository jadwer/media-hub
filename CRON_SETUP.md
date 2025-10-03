# 🕐 Configuración de Cron Jobs

## Backup Automático Diario

### 1. Dar permisos de ejecución a los scripts

```bash
chmod +x deploy.sh
chmod +x backup.sh
```

### 2. Configurar Cron Job

Editar crontab:
```bash
crontab -e
```

Agregar línea para backup diario a las 2 AM:
```cron
0 2 * * * cd /ruta/completa/a/audio-hub && ./backup.sh daily >> logs/backup.log 2>&1
```

**Explicación:**
- `0 2 * * *` = Todos los días a las 2:00 AM
- `cd /ruta/completa/a/audio-hub` = Ir al directorio de la app
- `./backup.sh daily` = Ejecutar backup en modo diario
- `>> logs/backup.log 2>&1` = Guardar output en log

### 3. Otras opciones de horario

**Cada 6 horas:**
```cron
0 */6 * * * cd /path/to/audio-hub && ./backup.sh daily >> logs/backup.log 2>&1
```

**Cada domingo a las 3 AM:**
```cron
0 3 * * 0 cd /path/to/audio-hub && ./backup.sh daily >> logs/backup.log 2>&1
```

**Cada día a medianoche:**
```cron
0 0 * * * cd /path/to/audio-hub && ./backup.sh daily >> logs/backup.log 2>&1
```

### 4. Verificar que funciona

Ver logs de cron:
```bash
grep CRON /var/log/syslog
# o
tail -f logs/backup.log
```

Listar cron jobs activos:
```bash
crontab -l
```

### 5. Backup Manual

Para hacer un backup manual en cualquier momento:
```bash
./backup.sh manual
```

## Limpieza Automática de Logs

Agregar job para limpiar logs antiguos (cada lunes a las 3 AM):

```cron
0 3 * * 1 find /path/to/audio-hub/logs -name "*.log" -mtime +30 -delete
```

Esto elimina logs con más de 30 días.

## Verificación de Espacio en Disco

Agregar job para verificar espacio y enviar alerta si está bajo (cada día a las 9 AM):

```cron
0 9 * * * df -h /path/to/audio-hub | grep -v Filesystem | awk '{print $5}' | sed 's/%//' | awk '{if ($1 > 80) print "⚠️ Disk usage is " $1 "%"}' | mail -s "Disk Alert" tu@email.com
```

## Windows (Task Scheduler)

Si estás en Windows, usar Task Scheduler en lugar de cron:

### 1. Abrir Task Scheduler
- Buscar "Task Scheduler" en el menú inicio
- O ejecutar: `taskschd.msc`

### 2. Crear nueva tarea
- Action → Create Basic Task
- Name: "Media Hub Daily Backup"
- Trigger: Daily, 2:00 AM
- Action: Start a program
  - Program: `C:\Windows\System32\bash.exe`
  - Arguments: `-c "cd /mnt/c/path/to/audio-hub && ./backup.sh daily"`

### 3. Habilitar WSL para ejecutar scripts
Si usas WSL (Windows Subsystem for Linux):

```powershell
# PowerShell script (backup.ps1)
wsl cd /mnt/c/dev/jaz/audio-hub `&`& ./backup.sh daily
```

Luego en Task Scheduler:
- Program: `powershell.exe`
- Arguments: `-File C:\path\to\backup.ps1`

## Monitoreo de Backups

### Verificar que los backups se están creando

```bash
# Listar backups recientes
ls -lh backups/daily/

# Ver el backup más reciente
ls -lt backups/daily/ | head -2

# Ver tamaño total de backups
du -sh backups/
```

### Script de verificación

Crear `check_backups.sh`:

```bash
#!/bin/bash

BACKUP_DIR="./backups/daily"
TODAY=$(date +%Y%m%d)
EXPECTED_BACKUP="${BACKUP_DIR}/backup-${TODAY}.tar.gz"

if [ -f "$EXPECTED_BACKUP" ]; then
    SIZE=$(du -h "$EXPECTED_BACKUP" | cut -f1)
    echo "✅ Backup de hoy existe: $SIZE"
else
    echo "❌ No se encontró backup de hoy: $EXPECTED_BACKUP"
    exit 1
fi
```

Agregar al cron (verificar a las 3 AM):
```cron
0 3 * * * cd /path/to/audio-hub && ./check_backups.sh || echo "Backup failed!" | mail -s "Backup Alert" tu@email.com
```

## Restaurar desde Backup

### Restaurar archivos

```bash
# Listar contenido del backup
tar -tzf backups/daily/backup-20251003.tar.gz

# Restaurar todo
tar -xzf backups/daily/backup-20251003.tar.gz

# Restaurar solo archivos
tar -xzf backups/daily/backup-20251003.tar.gz files/

# Restaurar solo .env
tar -xzf backups/daily/backup-20251003.tar.gz .env
```

### Restaurar en otra ubicación

```bash
# Restaurar a directorio temporal
mkdir /tmp/restore
tar -xzf backups/daily/backup-20251003.tar.gz -C /tmp/restore

# Revisar archivos
ls -la /tmp/restore
```

## Mejores Prácticas

1. **Múltiples ubicaciones**: Copiar backups a otro servidor/cloud
   ```bash
   # Ejemplo: copiar a servidor remoto
   scp backups/daily/backup-$(date +%Y%m%d).tar.gz user@backup-server:/backups/
   ```

2. **Cifrar backups sensibles**:
   ```bash
   # Encriptar con GPG
   gpg -c backup-20251003.tar.gz
   # Genera: backup-20251003.tar.gz.gpg
   ```

3. **Verificar integridad**:
   ```bash
   # Crear checksum
   sha256sum backup-20251003.tar.gz > backup-20251003.tar.gz.sha256

   # Verificar
   sha256sum -c backup-20251003.tar.gz.sha256
   ```

4. **Retention policy**:
   - Daily: 7 días (automático en backup.sh)
   - Weekly: 4 semanas
   - Monthly: 12 meses

## Troubleshooting

### El cron job no se ejecuta

1. Verificar que el script tenga permisos:
   ```bash
   ls -l backup.sh
   # Debe mostrar: -rwxr-xr-x
   ```

2. Verificar ruta completa en crontab:
   ```bash
   which bash
   # Usar ruta completa: /usr/bin/bash
   ```

3. Ver logs de cron:
   ```bash
   sudo tail -f /var/log/cron
   # o
   sudo tail -f /var/log/syslog | grep CRON
   ```

### Backup falla

1. Verificar espacio en disco:
   ```bash
   df -h
   ```

2. Verificar permisos de escritura:
   ```bash
   test -w backups/ && echo "OK" || echo "No write permission"
   ```

3. Ejecutar manualmente para ver errores:
   ```bash
   ./backup.sh daily
   ```

---

**Última actualización:** 2025-10-03
