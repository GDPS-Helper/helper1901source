<?php session_start();
require_once '../api/api.php';

$tags = $_GET['tags'] ?? null;
$os = $_GET['os'] ?? null;
$name = $_GET['name'] ?? null;

$gdpses = NewGdpsFinder(
    $_GET['method'],
    $_GET['page'],
    $tags,
    $os,
    $name);

$f = true;

$_SESSION['findKey'] = "method=".$_GET['method']."&page=".$_GET['page'];

isset($_GET['tags']) ?
$_SESSION['findKey'] .= "&tags=".implode('&tags=', $_GET['tags'])
: null;

isset($_GET['os']) ?
$_SESSION['findKey'] .= "&os=".implode('&os=', $_GET['os'])
: null;

isset($_GET['name']) ?
$_SESSION['findKey'] .= "&name=".$_GET['name']
: null;

echo '{';

foreach ($gdpses as $gdps) {
    echo $f ? '' : ',';
    $f = false;
    $gdps->GDPSrender();
}

echo '}';