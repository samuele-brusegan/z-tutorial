<?php
header('Content-Type: text/plain');
echo "REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'not set') . "\n";
echo "QUERY_STRING: " . ($_SERVER['QUERY_STRING'] ?? 'not set') . "\n";
echo "SCRIPT_NAME: " . ($_SERVER['SCRIPT_NAME'] ?? 'not set') . "\n";
echo "PHP_SELF: " . ($_SERVER['PHP_SELF'] ?? 'not set') . "\n";
echo "DOCUMENT_ROOT: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'not set') . "\n";
