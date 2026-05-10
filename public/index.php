<?php

use Illuminate\Contracts\Http\Kernel as HttpKernel;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Resolve base path (local + Hostinger)
|--------------------------------------------------------------------------
|
| Local (repository):
| - public/index.php
| - ../vendor, ../bootstrap/app.php
|
| Hostinger shared hosting (recommended structure):
| - public_html/index.php
| - ../laravel_app/vendor, ../laravel_app/bootstrap/app.php
|
*/
$basePath = dirname(__DIR__);
if (!is_file($basePath.'/vendor/autoload.php') && is_file($basePath.'/laravel_app/vendor/autoload.php')) {
    $basePath .= '/laravel_app';
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $basePath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $basePath.'/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $basePath.'/bootstrap/app.php';
if (method_exists($app, 'usePublicPath')) {
    $app->usePublicPath(__DIR__);
}

$request = Request::capture();
/** @var HttpKernel $kernel */
$kernel = $app->make(HttpKernel::class);

$response = $kernel->handle($request);
$response->send();

$kernel->terminate($request, $response);
