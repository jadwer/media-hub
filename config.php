<?php
return [
    'env' => getenv('APP_ENV') ?: 'local', // permite definir APP_ENV por .env o entorno

    'paths' => [
        'local' => [
            'folder'  => realpath(__DIR__ . '/files'),
            'webPath' => '/files',
        ],
        'production' => [
            'folder'  => '/var/www/mediahub/files', // ajústalo si cambia en producción real
            'webPath' => '/mediahub/files',
        ],
    ]
];

function debug_log($object = null, $label = null)
{
    $message = json_encode($object, JSON_PRETTY_PRINT);
    $label = "PHP: " . ($label ? " ($label): " : ': ');
    echo "<script>console.log(\"$label\", $message);</script>";
}
