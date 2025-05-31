<?php
if (!function_exists('getFileType')) {
    function getFileType($ext, $allowed_extensions) {
        foreach ($allowed_extensions as $type => $exts) {
            if (in_array($ext, $exts)) return $type;
        }
        return 'other';
    }
}
