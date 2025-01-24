<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);

if ($user->activated == 0) {
    echo '['.$point.','.$time.','.$canBump.']';
}
$time = time() + 7200;

$cTime = time();

$point = content::setPoint($_GET['id'], $time, $cTime);

if ($point == false)
    exit('no');

$canBump = $cTime - $point;

echo '['.$point.','.$time.','.$canBump.']';
