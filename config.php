<?php
return [
    'env' => getenv('APP_ENV') ?: 'local', // permite definir APP_ENV por .env o entorno

    'paths' => [
        'local' => [
            'folder'  => realpath(__DIR__ . '/../files'),
            'webPath' => '/files',
        ],
        'production' => [
            'folder'  => '/var/www/mediahub/files', // ajústalo si cambia en producción real
            'webPath' => '/mediahub/files',
        ],
    ]
];
