<?php
// ============================================================
// FRONT CONTROLLER — Z-Tutorial
// ============================================================

define('BASE_PATH', dirname(__DIR__));
date_default_timezone_set('Europe/Rome');

require_once BASE_PATH . '/src/Router.php';
require_once BASE_PATH . '/data.php';

$router = new Router();
require BASE_PATH . '/public/routes.php';

$url = $_SERVER['REQUEST_URI'];
if (!$router->dispatch($url)) {
    header('HTTP/1.0 404 Not Found');
    require BASE_PATH . '/views/404.php';
}
