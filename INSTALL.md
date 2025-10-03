# 📦 Instalación y Deployment - Media Hub

## Requisitos

- PHP 8.0 o superior
- Servidor web (Apache/Nginx) o PHP built-in server
- Extensiones PHP requeridas:
  - `fileinfo` (para validación MIME)
  - `json`
  - `session`

## Instalación Local (Desarrollo)

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd audio-hub
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` y configurar:
```bash
APP_ENV=local
AUTH_USERNAME=tu_usuario
AUTH_PASSWORD=tu_password_seguro
SESSION_LIFETIME=3600
MAX_UPLOADS_PER_MINUTE=10
```

### 3. Crear directorios necesarios
```bash
mkdir -p files logs
chmod 755 files logs
```

### 4. Iniciar servidor de desarrollo
```bash
php -S localhost:8000
```

### 5. Acceder a la aplicación
- URL: `http://localhost:8000`
- Login: Usar credenciales configuradas en `.env`

## Deployment en Producción

### 1. Preparar servidor

#### Apache
Crear archivo `.htaccess` en la raíz:
```apache
# Redirect to index.php
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Security headers (backup if PHP headers fail)
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
Header set X-XSS-Protection "1; mode=block"

# Protect sensitive files
<FilesMatch "^\.env">
    Order allow,deny
    Deny from all
</FilesMatch>
```

#### Nginx
Configuración del sitio:
```nginx
server {
    listen 80;
    server_name mediahub.example.com;
    root /var/www/mediahub;
    index index.php;

    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Deny access to sensitive files
    location ~ /\.env {
        deny all;
    }

    location ~ /logs/ {
        deny all;
    }
}
```

### 2. Configurar producción

Actualizar `.env`:
```bash
APP_ENV=production
AUTH_USERNAME=admin_prod
AUTH_PASSWORD=contraseña_muy_segura_aquí
SESSION_LIFETIME=7200
MAX_UPLOADS_PER_MINUTE=5
```

Actualizar `config.php` con rutas de producción:
```php
'production' => [
    'folder'  => '/var/www/mediahub/files',
    'webPath' => '/files',
]
```

### 3. Permisos
```bash
# Propietario web server (ajustar según tu sistema)
chown -R www-data:www-data /var/www/mediahub

# Permisos de archivos
find /var/www/mediahub -type f -exec chmod 644 {} \;
find /var/www/mediahub -type d -exec chmod 755 {} \;

# Directorios escribibles
chmod 775 /var/www/mediahub/files
chmod 775 /var/www/mediahub/logs
```

### 4. HTTPS (Recomendado)

#### Con Let's Encrypt (Certbot)
```bash
sudo certbot --nginx -d mediahub.example.com
```

Esto configurará automáticamente SSL y habilitará HSTS.

### 5. Optimizaciones de producción

#### PHP Configuration (`php.ini`)
```ini
# Seguridad
expose_php = Off
display_errors = Off
log_errors = On
error_log = /var/log/php/error.log

# Sesiones
session.cookie_httponly = 1
session.cookie_secure = 1  # Solo si usas HTTPS
session.use_strict_mode = 1

# Uploads
upload_max_filesize = 50M
post_max_size = 50M
max_file_uploads = 20
```

#### OPcache (Opcional, para mejor rendimiento)
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

## Backup y Mantenimiento

### Backup manual
```bash
# Backup de archivos
tar -czf backup-files-$(date +%Y%m%d).tar.gz files/

# Backup de playlists
cp -r playlists/ playlists-backup-$(date +%Y%m%d)/
```

### Limpieza de logs
```bash
# Rotar logs cada semana
find logs/ -name "*.log" -mtime +7 -delete
```

### Monitoreo de espacio
```bash
# Ver uso de disco
du -sh files/
df -h /var/www/mediahub
```

## Troubleshooting

### Error: "Session failed to start"
```bash
# Verificar permisos del directorio de sesiones
ls -la /var/lib/php/sessions
chmod 1733 /var/lib/php/sessions
```

### Error: "Upload failed"
```bash
# Verificar límites de PHP
php -i | grep upload_max_filesize
php -i | grep post_max_size

# Verificar permisos del directorio
ls -la files/
```

### Error: "Headers already sent"
```bash
# Verificar que no haya salida antes de headers
# Buscar espacios o BOM al inicio de archivos PHP
```

### Logs no se crean
```bash
# Verificar permisos
mkdir -p logs
chmod 775 logs
chown www-data:www-data logs
```

## Seguridad Post-Deployment

### Checklist
- [ ] `.env` no está en el repositorio (verificar `.gitignore`)
- [ ] Contraseñas fuertes configuradas
- [ ] HTTPS habilitado y funcionando
- [ ] Headers de seguridad activos (verificar con herramientas online)
- [ ] Rate limiting funcionando
- [ ] Logs rotando correctamente
- [ ] Backup automático configurado
- [ ] Firewall configurado (solo puertos 80/443 abiertos)
- [ ] Actualizaciones de PHP al día

### Herramientas de verificación
- [SSL Labs](https://www.ssllabs.com/ssltest/) - Test SSL/TLS
- [Security Headers](https://securityheaders.com/) - Test security headers
- [Observatory](https://observatory.mozilla.org/) - Security scan

## Soporte

Para problemas o preguntas, revisar:
1. `logs/app.log` - Errores de la aplicación
2. Logs del servidor web (Apache/Nginx)
3. Logs de PHP (`php_errors.log`)

---

**Versión:** 1.3.0
**Última actualización:** 2025-10-03
