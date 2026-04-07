<?php
// ============================================================
// ROTTE — Tutorial Hub
// ============================================================

// Home con griglia tutorial
$router->add('/', function () use ($tutorials) {
    require BASE_PATH . '/views/home.php';
});

// Apertura singolo tutorial per id
$router->add('/id/{id}', function ($params) use ($tutorials) {
    require BASE_PATH . '/views/tutorial.php';
});

// Alias con /id/ (trailing slash)
$router->add('/id', function ($params) {
    require BASE_PATH . '/views/home.php';
});
